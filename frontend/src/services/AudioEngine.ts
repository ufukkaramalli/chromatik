import type { Track, PlayerState, AudioEngineEvents } from '@/types/audio'
import { StreamResolver } from './StreamResolver'
import { getTrackId } from '@/utils/track'
import { clampPitch, computeNormalizationGainDb } from '@/utils/audioMath'

import type { AudioChannel } from './audio/types'
import { MasterChain } from './audio/MasterChain'
import { ChannelManager } from './audio/ChannelManager'
import { TransitionEngine } from './audio/TransitionEngine'
import { DropDetector } from './audio/DropDetector'
import { MediaSessionHandler } from './audio/MediaSessionHandler'

type EventHandler<K extends keyof AudioEngineEvents> = AudioEngineEvents[K]

/**
 * AudioEngine acts as the central Facade orchestrating playback, DSP nodes,
 * dual-channel DJ crossfades, and real-time audio analysis.
 */
export class AudioEngine {
  private static instance: AudioEngine

  // Sub-systems
  private masterChain = new MasterChain()

  // Dual-channel architecture for seamless crossfade
  private activeChannel: AudioChannel | null = null
  private outgoingChannel: AudioChannel | null = null

  // State
  private _state: PlayerState['status'] = 'idle'
  private _crossfadeDuration = 0
  private _volume = 1
  private _playbackRate = 1
  private _pitchSemitones = 0
  private _normalizationEnabled = true
  private _currentTrack: Track | null = null
  private _upcomingTrack: Track | null = null

  // Event Management
  private listeners: { [K in keyof AudioEngineEvents]?: Array<EventHandler<K>> } = {}

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  public setUpcomingTrack(track: Track | null): void {
    this._upcomingTrack = track
  }

  // --- Core Lifecycle & Initialization ---

  public async initOrResumeContext(): Promise<void> {
    const analyser = await this.masterChain.initOrResume(this._volume, this._pitchSemitones)
    if (analyser) {
      this.emit('analyser-ready', analyser)
    }
  }

  // --- Playback Management ---

  public async loadAndPlay(track: Track): Promise<void> {
    try {
      this.setState('loading')
      await this.initOrResumeContext()

      const trackId = getTrackId(track) || track.id || ''
      const streamUrl = await StreamResolver.resolve(trackId, track.url)

      let initialPlaybackRate = this._playbackRate
      let shouldGlideBackTempo = false

      // Handle transition from current activeChannel to outgoingChannel
      if (this.activeChannel) {
        if (this.outgoingChannel) {
          ChannelManager.cleanupChannel(this.outgoingChannel, this.masterChain.context)
          this.outgoingChannel = null
        }

        const isRunning = this.masterChain.context?.state === 'running'
        if (this._crossfadeDuration > 0 && isRunning) {
          const outgoing = this.activeChannel
          this.outgoingChannel = outgoing
          this.activeChannel = null

          const sync = TransitionEngine.calculateBpmAlignment(
            outgoing.track?.bpm,
            track?.bpm,
            this._playbackRate
          )
          if (sync.outgoingPlaybackRate) {
            outgoing.audio.playbackRate = sync.outgoingPlaybackRate
          }
          initialPlaybackRate = sync.initialIncomingRate
          shouldGlideBackTempo = sync.shouldGlideBackTempo
        } else {
          ChannelManager.cleanupChannel(this.activeChannel, this.masterChain.context)
          this.activeChannel = null
        }
      }

      const isCrossfadingFromPrevious = Boolean(this.outgoingChannel)
      const isCrossfading = isCrossfadingFromPrevious && this._crossfadeDuration > 0

      // Initialize new channel
      const newChannel = ChannelManager.createChannel({
        track,
        streamUrl,
        playbackRate: initialPlaybackRate,
        isCrossfading,
        context: this.masterChain.context,
        destinationNode: this.masterChain.inputNode
      })

      this.activeChannel = newChannel
      this._currentTrack = track

      const trackDur =
        track?.duration ||
        (newChannel.audio.duration && !isNaN(newChannel.audio.duration)
          ? newChannel.audio.duration
          : 180)

      const fadeInDuration = isCrossfading
        ? TransitionEngine.getMusicalCrossfadeDuration(
            this._crossfadeDuration,
            trackDur,
            track?.bpm
          )
        : 0.04

      // Smooth normalization glide to prevent volume jump during active mix
      this.applyNormalization(isCrossfading ? Math.min(2.0, fadeInDuration) : 0.04)

      this.setupEventListeners(newChannel)
      MediaSessionHandler.updateMetadata(track)

      // Start fade-in only when audio element begins actually rendering decoded samples ('playing')
      let fadeInTriggered = false
      const triggerFadeIn = () => {
        const ctx = this.masterChain.context
        const fadeGain = newChannel.fadeGain
        if (fadeInTriggered || !ctx || ctx.state !== 'running' || !fadeGain) return
        fadeInTriggered = true

        const playTime = ctx.currentTime
        if (typeof (fadeGain.gain as any).cancelAndHoldAtTime === 'function') {
          (fadeGain.gain as any).cancelAndHoldAtTime(playTime)
        } else {
          fadeGain.gain.cancelScheduledValues(playTime)
        }

        if (isCrossfading) {
          const outgoing = this.outgoingChannel

          const targetDuration = TransitionEngine.getMusicalCrossfadeDuration(
            this._crossfadeDuration,
            trackDur,
            outgoing?.track?.bpm,
            track?.bpm
          )

          // Outgoing track remaining timeline limit (avoid playing past audio.duration)
          let actualDuration = targetDuration
          if (outgoing && outgoing.audio.duration && !isNaN(outgoing.audio.duration)) {
            const outRemaining = Math.max(4.0, outgoing.audio.duration - outgoing.audio.currentTime)
            actualDuration = Math.min(targetDuration, outRemaining)
          }

          const { fadeInCurve, fadeOutCurve } = TransitionEngine.generateDJBlendCurves(128)

          // 1. Incoming Channel Fade-In
          fadeGain.gain.setValueCurveAtTime(fadeInCurve, playTime, actualDuration)

          // 2. Dual-Filter Morph: Incoming Channel blossoms outward from mid-tunnel (~650Hz / ~1400Hz)
          if (newChannel.lowCutFilter && newChannel.hiCutFilter) {
            const bassOpenTime = Math.min(5.5, Math.max(2.8, actualDuration * 0.45))
            const trebleOpenTime = Math.min(actualDuration * 0.85, actualDuration)
            try {
              newChannel.lowCutFilter.frequency.cancelScheduledValues(playTime)
              newChannel.lowCutFilter.frequency.setValueAtTime(650, playTime)
              newChannel.lowCutFilter.frequency.exponentialRampToValueAtTime(
                20,
                playTime + bassOpenTime
              )

              newChannel.hiCutFilter.frequency.cancelScheduledValues(playTime)
              newChannel.hiCutFilter.frequency.setValueAtTime(1400, playTime)
              newChannel.hiCutFilter.frequency.exponentialRampToValueAtTime(
                20000,
                playTime + trebleOpenTime
              )
            } catch {}
          }

          // 3. Dual-Filter Morph: Outgoing Channel converges into the center mid-tunnel
          if (outgoing && this.outgoingChannel === outgoing) {
            if (typeof (outgoing.fadeGain.gain as any).cancelAndHoldAtTime === 'function') {
              (outgoing.fadeGain.gain as any).cancelAndHoldAtTime(playTime)
            } else {
              outgoing.fadeGain.gain.cancelScheduledValues(playTime)
            }
            outgoing.fadeGain.gain.setValueCurveAtTime(fadeOutCurve, playTime, actualDuration)

            try {
              const filterSweepTime = actualDuration * 0.75

              outgoing.lowCutFilter.frequency.cancelScheduledValues(playTime)
              outgoing.lowCutFilter.frequency.setValueAtTime(
                Math.max(20, outgoing.lowCutFilter.frequency.value),
                playTime
              )
              outgoing.lowCutFilter.frequency.exponentialRampToValueAtTime(
                700,
                playTime + filterSweepTime
              )

              outgoing.hiCutFilter.frequency.cancelScheduledValues(playTime)
              outgoing.hiCutFilter.frequency.setValueAtTime(
                Math.min(20000, outgoing.hiCutFilter.frequency.value),
                playTime
              )
              outgoing.hiCutFilter.frequency.exponentialRampToValueAtTime(
                1200,
                playTime + filterSweepTime
              )
            } catch {}

            // Cleanup outgoing channel once the transition ends
            if (outgoing.cleanupTimer) clearTimeout(outgoing.cleanupTimer)
            outgoing.cleanupTimer = setTimeout(() => {
              if (this.outgoingChannel === outgoing) {
                ChannelManager.cleanupChannel(
                  outgoing,
                  this.masterChain.context,
                  this.activeChannel
                )
                this.outgoingChannel = null
              }
            }, actualDuration * 1000 + 100)
          }

          // Launch live Drop & Onset detection
          DropDetector.startIntroDropMonitor(
            newChannel,
            outgoing,
            this.masterChain.context,
            cand => this.outgoingChannel === cand
          )

          // Schedule tempo glide back after crossfade ends
          if (shouldGlideBackTempo) {
            setTimeout(() => {
              if (this.activeChannel === newChannel) {
                TransitionEngine.glidePlaybackRate(newChannel, this._playbackRate, 2000)
              }
            }, actualDuration * 1000)
          }
        } else {
          // Fresh playback: smooth 40ms micro-ramp starting from 0 to eliminate audio pop
          fadeGain.gain.setValueAtTime(0.00001, playTime)
          fadeGain.gain.linearRampToValueAtTime(1, playTime + 0.04)
        }
      }

      // Hook directly to HTMLMediaElement 'playing' event
      newChannel.audio.addEventListener('playing', triggerFadeIn, {
        once: true,
        signal: newChannel.abortController.signal
      })

      newChannel.audio.load()
      await newChannel.audio.play()

      // Backup trigger in case 'playing' already fired or wasn't dispatched by browser
      triggerFadeIn()
    } catch (err) {
      console.error('[AudioEngine] Playback failed', err)
      if (this.outgoingChannel) {
        ChannelManager.cleanupChannel(this.outgoingChannel, this.masterChain.context)
        this.outgoingChannel = null
      }
      this.setState('error')
      this.emit('error', err instanceof Error ? err : new Error(String(err)))
    }
  }

  public pause(): void {
    if (this.activeChannel) {
      this.activeChannel.audio.pause()
    }
    if (this.outgoingChannel) {
      this.outgoingChannel.audio.pause()
    }
  }

  public resume(): void {
    if (this.masterChain.context?.state === 'suspended') {
      this.masterChain.context.resume()
    }
    if (this.activeChannel) {
      this.activeChannel.audio.play().catch(e => {
        console.error('[AudioEngine] Resume failed', e)
        this.emit('error', e)
      })
    }
    if (this.outgoingChannel) {
      this.outgoingChannel.audio.play().catch(() => {})
    }
  }

  public seekTo(seconds: number): void {
    if (this.outgoingChannel) {
      ChannelManager.cleanupChannel(this.outgoingChannel, this.masterChain.context)
      this.outgoingChannel = null
    }
    if (this.activeChannel) {
      this.activeChannel.audio.currentTime = seconds
    }
  }

  public setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value))
    this.masterChain.setVolume(this._volume)
  }

  public setCrossfadeDuration(seconds: number): void {
    this._crossfadeDuration = Math.max(0, seconds)
  }

  public setPlaybackRate(rate: number): void {
    this._playbackRate = Math.max(0.5, Math.min(2.0, Number(rate.toFixed(2))))
    if (this.activeChannel) {
      this.activeChannel.audio.playbackRate = this._playbackRate
      this.activeChannel.audio.preservesPitch = true
    }
    this.emit('rate-change', this._playbackRate)
  }

  public setPitchSemitones(semitones: number): void {
    this._pitchSemitones = clampPitch(semitones)
    this.masterChain.setPitchSemitones(this._pitchSemitones)
    this.emit('pitch-change', this._pitchSemitones)
  }

  public setNormalizationEnabled(enabled: boolean): void {
    this._normalizationEnabled = enabled
    this.applyNormalization(0.05)
  }

  /** Gain applied to the current track in dB (null = disabled or track not analysed) */
  public get normalizationGainDb(): number | null {
    if (!this._normalizationEnabled) return null
    return computeNormalizationGainDb(this._currentTrack?.loudness?.integrated)
  }

  /**
   * Applies the current track's normalization gain and the matching limiter ceiling.
   */
  private applyNormalization(rampSeconds: number): void {
    const gainDb = this.normalizationGainDb
    this.masterChain.applyNormalization(gainDb, rampSeconds)
    this.emit('normalization-change', this._normalizationEnabled, gainDb)
  }

  // --- Getters ---

  public get currentTime(): number {
    return this.activeChannel ? this.activeChannel.audio.currentTime : 0
  }

  public get duration(): number {
    return this.activeChannel ? this.activeChannel.audio.duration || 0 : 0
  }

  public get state(): PlayerState['status'] {
    return this._state
  }

  public get playbackRate(): number {
    return this._playbackRate
  }

  public get pitchSemitones(): number {
    return this._pitchSemitones
  }

  public get normalizationEnabled(): boolean {
    return this._normalizationEnabled
  }

  public get analyserNode(): AnalyserNode | null {
    return this.masterChain.analyserNode
  }

  public getMusicalCrossfadeDuration(trackDuration: number, bpmA?: number, bpmB?: number): number {
    return TransitionEngine.getMusicalCrossfadeDuration(
      this._crossfadeDuration,
      trackDuration,
      bpmA,
      bpmB
    )
  }

  // --- Event Handling ---

  private setState(newState: PlayerState['status']) {
    if (this._state !== newState) {
      this._state = newState
      this.emit('state-change', newState)
    }
  }

  private setupEventListeners(channel: AudioChannel) {
    const audio = channel.audio
    const signal = channel.abortController.signal

    audio.addEventListener(
      'play',
      () => {
        if (this.activeChannel === channel) {
          this.setState('playing')
          if (this.masterChain.context?.state === 'suspended') {
            this.masterChain.context.resume()
          }
        }
      },
      { signal }
    )

    audio.addEventListener(
      'pause',
      () => {
        if (this.activeChannel === channel && !this.outgoingChannel) {
          this.setState('paused')
        }
      },
      { signal }
    )

    audio.addEventListener(
      'waiting',
      () => {
        if (this.activeChannel === channel) this.setState('buffering')
      },
      { signal }
    )

    audio.addEventListener(
      'playing',
      () => {
        if (this.activeChannel === channel) this.setState('playing')
      },
      { signal }
    )

    // Time update and smart musical crossfade trigger
    let crossfadeTriggered = false
    let silenceStreak = 0

    audio.addEventListener(
      'timeupdate',
      () => {
        if (this.activeChannel !== channel) return

        this.emit('time-update', audio.currentTime, audio.duration || 0)

        // Calculate buffer
        if (audio.buffered.length > 0 && audio.duration) {
          const buffered = audio.buffered.end(audio.buffered.length - 1) / audio.duration
          this.emit('buffer-update', buffered)
        }

        if (!audio.duration || audio.currentTime < 3) return

        const remainingTime = audio.duration - audio.currentTime

        // Outro Silence Guard:
        if (remainingTime <= 5 && !crossfadeTriggered && channel.analyser) {
          const freqData = new Uint8Array(channel.analyser.frequencyBinCount)
          channel.analyser.getByteFrequencyData(freqData)
          let totalEnergy = 0
          for (let i = 0; i < freqData.length; i++) totalEnergy += freqData[i]

          if (totalEnergy < 2) {
            silenceStreak++
            if (silenceStreak >= 6) {
              crossfadeTriggered = true
              this.emit('track-ended')
              return
            }
          } else {
            silenceStreak = 0
          }
        }

        if (this._crossfadeDuration <= 0) return

        const nextBpm = this._upcomingTrack?.bpm
        const cf = this.getMusicalCrossfadeDuration(audio.duration, channel.track?.bpm, nextBpm)
        if (cf <= 0 || audio.duration <= cf * 1.5 || audio.currentTime < 3) return

        // Musical phrase boundary trigger: starts at (audio.duration - cf)
        if (!crossfadeTriggered && audio.currentTime >= audio.duration - cf) {
          crossfadeTriggered = true
          this.emit('track-ended')
        }
      },
      { signal }
    )

    audio.addEventListener(
      'ended',
      () => {
        if (this.activeChannel === channel && !crossfadeTriggered) {
          this.emit('track-ended')
        }
      },
      { signal }
    )

    audio.addEventListener(
      'error',
      e => {
        console.error('[AudioEngine] HTMLAudioElement error', e)
        if (this.activeChannel === channel) {
          this.setState('error')
          this.emit('error', new Error('Media resource loading failed'))
        }
      },
      { signal }
    )
  }

  private cleanupCurrentAudio() {
    if (this.activeChannel) {
      ChannelManager.cleanupChannel(this.activeChannel, this.masterChain.context)
      this.activeChannel = null
    }
    if (this.outgoingChannel) {
      ChannelManager.cleanupChannel(this.outgoingChannel, this.masterChain.context)
      this.outgoingChannel = null
    }
  }

  // --- Event Emitter Implementation ---

  public on<K extends keyof AudioEngineEvents>(event: K, fn: EventHandler<K>): void {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event]!.push(fn)
  }

  public off<K extends keyof AudioEngineEvents>(event: K, fn: EventHandler<K>): void {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event]!.filter(listener => listener !== fn) as any
  }

  private emit<K extends keyof AudioEngineEvents>(
    event: K,
    ...args: Parameters<AudioEngineEvents[K]>
  ): void {
    if (this.listeners[event]) {
      this.listeners[event]!.forEach(fn => (fn as any)(...args))
    }
  }

  // --- Cleanup ---

  public destroy(): void {
    this.cleanupCurrentAudio()
    this.masterChain.destroy()
    this.listeners = {}
  }
}

export const engine = AudioEngine.getInstance()
