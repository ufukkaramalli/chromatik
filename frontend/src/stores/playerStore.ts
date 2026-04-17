import { defineStore } from 'pinia'
import type { Track, PlayerState } from '@/types/audio'
import { engine } from '@/services/AudioEngine'
import { api } from '@/lib/axios'

// Helper to init engine events once
let engineEventsInitialized = false

export const usePlayerStore = defineStore('player', {
  state: (): Omit<PlayerState, 'error'> & { currentTrack: Track | null, error: string | null } => ({
    status: 'idle',
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    isMuted: false,
    error: null,
    crossfadeDuration: Number(localStorage.getItem('chromatik:crossfade')) || 0
  }),

  // bottomPlayerVisible functionality carried over
  getters: {
    bottomPlayerVisible: (state) => state.currentTrack !== null
  },

  actions: {
    initEngineListeners() {
      if (engineEventsInitialized) return
      engineEventsInitialized = true

      // Initialize crossfade from saved preference
      engine.setCrossfadeDuration(this.crossfadeDuration)

      engine.on('state-change', (status) => {
        this.status = status
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
      
      // If we are just resuming the current track
      if (this.currentTrack?.id === track.id && this.status !== 'idle') {
        engine.resume()
        return
      }

      this.currentTrack = track
      this.error = null
      
      // Attempt to increment play count via API (similar to original logic)
      api.post('/track/play-increase', { id: track.id }).catch(() => {})

      await engine.loadAndPlay(track)
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
    }
  }
})
