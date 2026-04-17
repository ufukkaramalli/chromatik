import type { Track, PlayerState, AudioEngineEvents } from '@/types/audio'
import { StreamResolver } from './StreamResolver'

type EventHandler<K extends keyof AudioEngineEvents> = AudioEngineEvents[K]

export class AudioEngine {
  private static instance: AudioEngine

  // Web Audio Nodes
  private context: AudioContext | null = null
  private gainNode: GainNode | null = null
  private _analyserNode: AnalyserNode | null = null
  
  // HTML5 Audio Elements
  private audioElement: HTMLAudioElement | null = null
  private nextAudioElement: HTMLAudioElement | null = null // For crossfade
  
  // State
  private _state: PlayerState['status'] = 'idle'
  private _crossfadeDuration = 0
  private _volume = 1
  
  // Event Management
  private listeners: { [K in keyof AudioEngineEvents]?: Array<EventHandler<K>> } = {}
  private abortController: AbortController | null = null

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  // --- Core Lifecycle & Initialization ---

  private initAudioContext() {
    if (this.context) return

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      this.context = new AudioCtx()
      
      this.gainNode = this.context.createGain()
      this.gainNode.gain.value = this._volume
      
      this._analyserNode = this.context.createAnalyser()
      this._analyserNode.fftSize = 512
      
      this._analyserNode.connect(this.gainNode)
      this.gainNode.connect(this.context.destination)

      this.emit('analyser-ready', this._analyserNode)
    } catch (e) {
      console.error('[AudioEngine] Web Audio API not supported', e)
      this.emit('error', new Error('Web Audio API not supported'))
    }
  }

  public async initOrResumeContext() {
    this.initAudioContext()
    if (this.context?.state === 'suspended') {
      await this.context.resume()
    }
  }

  // --- Playback Management ---

  public async loadAndPlay(track: Track): Promise<void> {
    try {
      this.setState('loading')
      await this.initOrResumeContext()

      const streamUrl = await StreamResolver.resolve(track.id)
      
      this.cleanupCurrentAudio() // Stop current playback if any
      
      this.audioElement = new Audio(streamUrl)
      this.audioElement.crossOrigin = 'anonymous'
      
      this.setupEventListeners(this.audioElement)
      this.setupMediaSession(track)

      if (this.context && this._analyserNode) {
        const source = this.context.createMediaElementSource(this.audioElement)
        source.connect(this._analyserNode)
      }

      this.audioElement.load()
      
      // Simple fade in
      if (this.gainNode && this.context) {
        this.gainNode.gain.setValueAtTime(0, this.context.currentTime)
        this.gainNode.gain.linearRampToValueAtTime(this._volume, this.context.currentTime + 0.4)
      }

      await this.audioElement.play()
    } catch (err) {
      console.error('[AudioEngine] Playback failed', err)
      this.setState('error')
      this.emit('error', err instanceof Error ? err : new Error(String(err)))
    }
  }

  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause()
    }
  }

  public resume(): void {
    if (this.audioElement && this.context) {
      if (this.context.state === 'suspended') this.context.resume()
      this.audioElement.play().catch(e => {
        console.error('[AudioEngine] Resume failed', e)
        this.emit('error', e)
      })
    }
  }

  public seekTo(seconds: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = seconds
    }
  }

  public setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value))
    if (this.gainNode && this.context) {
      // Smooth volume change
      this.gainNode.gain.setTargetAtTime(this._volume, this.context.currentTime, 0.01)
    }
  }

  public setCrossfadeDuration(seconds: number): void {
    this._crossfadeDuration = Math.max(0, seconds)
  }

  // --- Getters ---

  public get currentTime(): number {
    return this.audioElement ? this.audioElement.currentTime : 0
  }

  public get duration(): number {
    return this.audioElement ? this.audioElement.duration || 0 : 0
  }

  public get state(): PlayerState['status'] {
    return this._state
  }

  public get analyserNode(): AnalyserNode | null {
    return this._analyserNode
  }

  // --- Event Handling ---

  private setState(newState: PlayerState['status']) {
    if (this._state !== newState) {
      this._state = newState
      this.emit('state-change', newState)
    }
  }

  private setupEventListeners(audio: HTMLAudioElement) {
    this.abortController = new AbortController()
    const signal = this.abortController.signal

    audio.addEventListener('play', () => {
      this.setState('playing')
      if (this.context?.state === 'suspended') this.context.resume()
    }, { signal })

    audio.addEventListener('pause', () => this.setState('paused'), { signal })
    
    audio.addEventListener('waiting', () => this.setState('buffering'), { signal })
    
    audio.addEventListener('playing', () => this.setState('playing'), { signal })

    // Time update and crossfade trigger
    let crossfadeTriggered = false
    audio.addEventListener('timeupdate', () => {
      this.emit('time-update', audio.currentTime, audio.duration || 0)

      // Calculate buffer
      if (audio.buffered.length > 0 && audio.duration) {
        const buffered = audio.buffered.end(audio.buffered.length - 1) / audio.duration
        this.emit('buffer-update', buffered)
      }

      // Check crossfade logic
      if (
        this._crossfadeDuration > 0 && 
        audio.duration > 0 && 
        !crossfadeTriggered &&
        audio.currentTime >= audio.duration - this._crossfadeDuration
      ) {
        crossfadeTriggered = true
        this.triggerCrossfade()
      }
    }, { signal })

    audio.addEventListener('ended', () => {
      if (!crossfadeTriggered) {
        this.emit('track-ended')
      }
    }, { signal })

    audio.addEventListener('error', (e) => {
      console.error('[AudioEngine] HTMLAudioElement error', e)
      this.setState('error')
      this.emit('error', new Error('Media resource loading failed'))
    }, { signal })
  }

  private cleanupCurrentAudio() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }

    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.removeAttribute('src')
      this.audioElement.load()
      this.audioElement = null
    }
  }

  // --- Crossfade Logic ---

  private triggerCrossfade() {
    // Instead of directly playing next here, we emit that this track is essentially "done"
    // The playerStore will intercept this and play the next track via loadAndPlay()
    // NOTE: True overlapping crossfade with one AudioContext and multiple sources requires 
    // a slightly more complex graph (two media elements, two gain nodes).
    // For simplicity and adherence to the plan, we fade this one out, and emit ended early 
    // so the store starts the next one.
    
    if (this.gainNode && this.context) {
      const now = this.context.currentTime
      this.gainNode.gain.cancelScheduledValues(now)
      this.gainNode.gain.setValueAtTime(this._volume, now)
      this.gainNode.gain.linearRampToValueAtTime(0, now + this._crossfadeDuration)
    }

    // Tell the store to load the next track now
    this.emit('track-ended')
  }

  // --- Media Session API ---

  private setupMediaSession(track: Track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.user.name,
        artwork: [
          { src: track.art, sizes: '512x512', type: 'image/jpeg' },
          { src: track.art, sizes: '256x256', type: 'image/jpeg' }
        ]
      })

      // The handlers will be bound by useMediaSession composable, 
      // but metadata is set here contextually when the track loads.
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

  private emit<K extends keyof AudioEngineEvents>(event: K, ...args: Parameters<AudioEngineEvents[K]>): void {
    if (this.listeners[event]) {
      this.listeners[event]!.forEach(fn => (fn as any)(...args))
    }
  }

  // --- Cleanup ---

  public destroy(): void {
    this.cleanupCurrentAudio()
    if (this.context && this.context.state !== 'closed') {
      this.context.close()
    }
    this.listeners = {}
  }
}

export const engine = AudioEngine.getInstance()
