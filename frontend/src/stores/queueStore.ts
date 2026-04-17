import { defineStore } from 'pinia'
import type { Track, QueueItem, RepeatMode } from '@/types/audio'
import { engine } from '@/services/AudioEngine'
import { usePlayerStore } from './playerStore'

export const useQueueStore = defineStore('queue', {
  state: () => ({
    queue: [] as QueueItem[],
    originalQueue: [] as QueueItem[], // Preserved for un-shuffling
    currentIndex: -1,
    repeatMode: 'off' as RepeatMode,
    shuffle: false
  }),

  getters: {
    currentTrack: (state): Track | null => 
      state.currentIndex >= 0 && state.currentIndex < state.queue.length 
        ? state.queue[state.currentIndex].track 
        : null,
    
    hasNext: (state): boolean => {
      if (state.repeatMode === 'all') return state.queue.length > 0
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
    },

    addToQueue(track: Track) {
      const item = { track, queueId: crypto.randomUUID() }
      this.originalQueue.push(item)
      this.queue.push(item)
      if (this.queue.length === 1) {
        this.currentIndex = 0
      }
    },

    setCurrentIndex(index: number) {
      if (index >= 0 && index < this.queue.length) {
        this.currentIndex = index
      }
    },

    async next() {
      if (this.queue.length === 0) return

      if (this.repeatMode === 'one') {
        // Just replay current
      } else if (this.currentIndex < this.queue.length - 1) {
        this.currentIndex++
      } else if (this.repeatMode === 'all') {
        this.currentIndex = 0
      } else {
        // End of queue, no repeat
        return
      }

      this.playCurrent()
    },

    async previous() {
      if (this.queue.length === 0) return

      // If playing for more than 3 seconds, previous usually restarts the track rather than actually going back
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

    playCurrent() {
      const track = this.currentTrack
      if (track) {
        // Note: usePlayerStore interacts with AudioEngine directly
        // We defer to it to keep metadata in sync
        const player = usePlayerStore()
        player.play(track)
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
