import { defineStore } from 'pinia'
import type { Track, PlayerState } from '@/types/audio'
import { engine } from '@/services/AudioEngine'
import { api } from '@/lib/axios'
import { getTrackId } from '@/utils/track'

// Helper to init engine events once
let engineEventsInitialized = false

const NORMALIZATION_STORAGE_KEY = 'chromatik:normalization'

export const usePlayerStore = defineStore('player', {
  state: (): Omit<PlayerState, 'error'> & {
    currentTrack: Track | null,
    error: string | null,
    normalizationEnabled: boolean,
    normalizationGainDb: number | null
  } => ({
    status: 'idle',
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    isMuted: false,
    error: null,
    crossfadeDuration: Number(localStorage.getItem('chromatik:crossfade')) || 0,
    playbackRate: 1,
    pitchSemitones: 0,
    // Loudness normalization is on unless the listener explicitly turned it off
    normalizationEnabled: localStorage.getItem(NORMALIZATION_STORAGE_KEY) !== '0',
    normalizationGainDb: null
  }),

  // bottomPlayerVisible functionality carried over
  getters: {
    bottomPlayerVisible: (state) => state.currentTrack !== null,
    // Normalization is a standing preference, not a temporary modifier: it doesn't count here
    hasActiveModifiers: (state) => state.playbackRate !== 1 || state.pitchSemitones !== 0
  },

  actions: {
    initEngineListeners() {
      if (engineEventsInitialized) return
      engineEventsInitialized = true

      engine.on('normalization-change', (enabled, gainDb) => {
        this.normalizationEnabled = enabled
        this.normalizationGainDb = gainDb
      })

      // Initialize crossfade from saved preference
      engine.setCrossfadeDuration(this.crossfadeDuration)
      engine.setPlaybackRate(this.playbackRate)
      engine.setPitchSemitones(this.pitchSemitones)
      engine.setNormalizationEnabled(this.normalizationEnabled)

      engine.on('state-change', (status) => {
        this.status = status
      })

      engine.on('rate-change', (rate) => {
        this.playbackRate = rate
      })

      engine.on('pitch-change', (semitones) => {
        this.pitchSemitones = semitones
      })

      engine.on('time-update', (current, dur) => {
        this.currentTime = current
        this.duration = dur
      })

      engine.on('buffer-update', (buf) => {
        this.buffered = buf * 100 // keep as percentage for UI backwards compatibility
      })

      engine.on('error', (err) => {
        this.error = err.message
        this.status = 'error'
      })

      engine.on('track-ended', () => {
        // Track ended (or crossfade triggered), tell queue store to play next
        import('./queueStore').then(({ useQueueStore }) => {
          const queue = useQueueStore()
          queue.next()
        })
      })
    },

    async play(track: Track) {
      if (!engineEventsInitialized) this.initEngineListeners()
      
      const currentId = getTrackId(this.currentTrack)
      const targetId = getTrackId(track)

      // If we are just resuming the current track
      if (currentId && targetId && currentId === targetId && this.status !== 'idle') {
        // If track has reached the end or stopped at the end, restart from beginning
        if (this.duration > 0 && this.currentTime >= this.duration - 0.5) {
          engine.seekTo(0)
        }
        engine.resume()
        return
      }

      const normalizedTrack = {
        ...track,
        id: targetId || track.id
      }

      this.currentTrack = normalizedTrack
      this.error = null
      
      // Attempt to increment play count via API
      if (targetId) {
        api.post('/track/play-increase', { id: targetId }, { skipDbRetry: true }).catch(() => {})
      }

      await engine.loadAndPlay(normalizedTrack)
    },

    pause() {
      engine.pause()
    },

    toggle() {
      if (this.status === 'playing') {
        this.pause()
      } else if (this.currentTrack) {
        this.play(this.currentTrack)
      }
    },

    seekTo(percent: number) {
      // percent is 0-100 from slider
      if (this.duration) {
        engine.seekTo((percent / 100) * this.duration)
      }
    },

    setVolume(val: number) {
      // Assuming slider is 0-100
      this.volume = val / 100
      if (!this.isMuted) {
        engine.setVolume(this.volume)
      }
    },

    toggleMute() {
      this.isMuted = !this.isMuted
      engine.setVolume(this.isMuted ? 0 : this.volume)
    },

    setCrossfadeDuration(val: number) {
      this.crossfadeDuration = Math.max(0, val)
      engine.setCrossfadeDuration(this.crossfadeDuration)
      localStorage.setItem('chromatik:crossfade', String(this.crossfadeDuration))
    },

    setPlaybackRate(val: number) {
      this.playbackRate = val
      engine.setPlaybackRate(val)
    },

    setPitchSemitones(val: number) {
      this.pitchSemitones = val
      engine.setPitchSemitones(val)
    },

    setNormalizationEnabled(enabled: boolean) {
      this.normalizationEnabled = enabled
      engine.setNormalizationEnabled(enabled)
      localStorage.setItem(NORMALIZATION_STORAGE_KEY, enabled ? '1' : '0')
    },

    resetPlaybackModifiers() {
      this.setPlaybackRate(1)
      this.setPitchSemitones(0)
    }
  }
})
