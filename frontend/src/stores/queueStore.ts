import { defineStore } from 'pinia'
import type { Track, QueueItem, RepeatMode } from '@/types/audio'
import { engine } from '@/services/AudioEngine'
import { api } from '@/lib/axios'
import { getTrackId } from '@/utils/track'
import { usePlayerStore } from './playerStore'

export const useQueueStore = defineStore('queue', {
  state: () => ({
    queue: [] as QueueItem[],
    originalQueue: [] as QueueItem[], // Preserved for un-shuffling
    currentIndex: -1,
    repeatMode: 'off' as RepeatMode,
    shuffle: false,
    autoplay: true,
    isFetchingAutoplay: false
  }),

  getters: {
    currentTrack: (state): Track | null => 
      state.currentIndex >= 0 && state.currentIndex < state.queue.length 
        ? state.queue[state.currentIndex].track 
        : null,
    
    hasNext: (state): boolean => {
      if (state.repeatMode === 'all') return state.queue.length > 0
      if (state.autoplay) return true
      return state.currentIndex < state.queue.length - 1
    },

    hasPrevious: (state): boolean => state.currentIndex > 0 || state.repeatMode === 'all'
  },

  actions: {
    setQueue(tracks: Track[], startIndex = 0) {
      const newQueue = tracks.map(track => ({
        track,
        queueId: crypto.randomUUID()
      }))

      this.originalQueue = [...newQueue]
      
      if (this.shuffle) {
        const current = newQueue[startIndex]
        const remaining = [...newQueue.slice(0, startIndex), ...newQueue.slice(startIndex + 1)]
        this.shuffleArray(remaining)
        this.queue = [current, ...remaining]
        this.currentIndex = 0
      } else {
        this.queue = newQueue
        this.currentIndex = startIndex
      }
      this.syncUpcomingTrack()
      console.log(`[QueueStore] Queue set with ${this.queue.length} tracks. Initial index: ${this.currentIndex}`)
    },

    syncUpcomingTrack() {
      const nextIndex = this.currentIndex + 1
      let nextTrack: Track | null = null
      if (nextIndex < this.queue.length) {
        nextTrack = this.queue[nextIndex].track
      } else if (this.repeatMode === 'all' && this.queue.length > 0) {
        nextTrack = this.queue[0].track
      }
      engine.setUpcomingTrack(nextTrack)
    },

    addToQueue(track: Track) {
      const item = { track, queueId: crypto.randomUUID() }
      this.originalQueue.push(item)
      this.queue.push(item)
      if (this.queue.length === 1 || this.currentIndex === -1) {
        this.currentIndex = this.queue.length - 1
      }
      this.syncUpcomingTrack()
    },

    setCurrentIndex(index: number) {
      if (index >= 0 && index < this.queue.length) {
        this.currentIndex = index
        this.syncUpcomingTrack()
      }
    },

    async next() {
      if (this.queue.length === 0) {
        if (this.autoplay) {
          const added = await this.fetchAutoplayRecommendations()
          if (added > 0) {
            this.currentIndex = 0
            this.playCurrent()
          }
        }
        return
      }

      if (this.repeatMode === 'one') {
        // Replay current track from beginning
        engine.seekTo(0)
        this.playCurrent()
        return
      }

      if (this.currentIndex < this.queue.length - 1) {
        this.currentIndex++
        console.log(`[QueueStore] Next track triggered. New index: ${this.currentIndex}`)
        this.playCurrent()
        return
      }

      if (this.repeatMode === 'all') {
        this.currentIndex = 0
        console.log(`[QueueStore] Next track triggered (repeat all). New index: ${this.currentIndex}`)
        this.playCurrent()
        return
      }

      // End of queue: If autoplay is enabled, fetch recommendations to keep music going
      if (this.autoplay) {
        const added = await this.fetchAutoplayRecommendations()
        if (added > 0 && this.currentIndex < this.queue.length - 1) {
          this.currentIndex++
          console.log(`[QueueStore] Autoplay continued with new track. New index: ${this.currentIndex}`)
          this.playCurrent()
          return
        }
      }

      console.log('[QueueStore] End of queue reached, no more tracks.')
    },

    async previous() {
      if (this.queue.length === 0) return

      // If playing for more than 3 seconds, previous restarts the track
      if (engine.currentTime > 3) {
        engine.seekTo(0)
        return
      }

      if (this.currentIndex > 0) {
        this.currentIndex--
      } else if (this.repeatMode === 'all') {
        this.currentIndex = this.queue.length - 1
      }
      
      this.playCurrent()
    },

    toggleShuffle() {
      this.shuffle = !this.shuffle
      
      if (this.queue.length === 0) return

      const currentItem = this.queue[this.currentIndex]

      if (this.shuffle) {
        const remaining = this.queue.filter(i => i.queueId !== currentItem.queueId)
        this.shuffleArray(remaining)
        this.queue = [currentItem, ...remaining]
        this.currentIndex = 0
      } else {
        this.queue = [...this.originalQueue]
        this.currentIndex = this.queue.findIndex(i => i.queueId === currentItem.queueId)
      }
    },

    cycleRepeat() {
      const modes: RepeatMode[] = ['off', 'all', 'one']
      const idx = modes.indexOf(this.repeatMode)
      this.repeatMode = modes[(idx + 1) % modes.length]
    },

    toggleAutoplay() {
      this.autoplay = !this.autoplay
    },

    playCurrent() {
      this.syncUpcomingTrack()
      const track = this.currentTrack
      if (track) {
        const player = usePlayerStore()
        player.play(track)
      }
    },

    async fetchAutoplayRecommendations(): Promise<number> {
      if (this.isFetchingAutoplay) return 0
      this.isFetchingAutoplay = true

      try {
        // Collect current track IDs to prevent duplicate queuing
        const existingIds = new Set(
          this.queue
            .map(item => getTrackId(item.track))
            .filter((id): id is string => Boolean(id))
        )

        // Fetch recent tracks or most streamed tracks from backend
        const response = await api.get('/track/recent')
        const fetchedTracks: Track[] = response.data?.tracks || response.data?.Recent || []

        const candidates = fetchedTracks.filter(t => {
          const id = getTrackId(t)
          return id && !existingIds.has(id)
        })

        if (candidates.length === 0) {
          // If no recent candidates, try most streamed
          const streamedRes = await api.get('/track/moststreamed')
          const streamedTracks: Track[] = streamedRes.data?.MostStreamed || []
          const filteredStreamed = streamedTracks.filter(t => {
            const id = getTrackId(t)
            return id && !existingIds.has(id)
          })
          candidates.push(...filteredStreamed)
        }

        if (candidates.length > 0) {
          // If the current playing track has a BPM, sort candidates by tempo proximity for optimal Automix transitions
          const currentBpm = Number(this.currentTrack?.bpm)
          if (currentBpm > 50 && currentBpm < 220) {
            candidates.sort((a, b) => {
              const diffA = a.bpm ? Math.abs(Number(a.bpm) - currentBpm) : 999
              const diffB = b.bpm ? Math.abs(Number(b.bpm) - currentBpm) : 999
              return diffA - diffB
            })
          }

          // Pick up to 10 tracks and append to queue
          const toAdd = candidates.slice(0, 10).map(track => ({
            track,
            queueId: crypto.randomUUID()
          }))

          this.originalQueue.push(...toAdd)
          this.queue.push(...toAdd)
          console.log(`[QueueStore] Autoplay added ${toAdd.length} tempo-aligned tracks to queue. Total: ${this.queue.length}`)
          return toAdd.length
        }

        return 0
      } catch (err) {
        console.warn('[QueueStore] Failed to fetch autoplay tracks', err)
        return 0
      } finally {
        this.isFetchingAutoplay = false
      }
    },

    shuffleArray(array: any[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
    }
  }
})

