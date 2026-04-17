import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useQueueStore } from '@/stores/queueStore'

export function usePlayer() {
  const player = usePlayerStore()
  const queue = useQueueStore()

  // We expose a unified interface so components don't need to know about both stores
  return {
    // Current Track info
    currentTrack: computed(() => player.currentTrack),
    
    // Playback State
    status: computed(() => player.status),
    isPlaying: computed(() => player.status === 'playing'),
    isLoading: computed(() => player.status === 'loading'),
    isBuffering: computed(() => player.status === 'buffering'),
    isError: computed(() => player.status === 'error'),
    errorMessage: computed(() => player.error),
    
    // Time & Progress
    currentTime: computed(() => player.currentTime),
    duration: computed(() => player.duration),
    progress: computed(() => player.duration ? (player.currentTime / player.duration) * 100 : 0),
    buffered: computed(() => player.buffered),
    
    // Controls State
    volume: computed({
      get: () => player.volume * 100,
      set: (val: number) => player.setVolume(val)
    }),
    isMuted: computed(() => player.isMuted),
    
    // Queue State
    repeatMode: computed(() => queue.repeatMode),
    shuffle: computed(() => queue.shuffle),
    hasNext: computed(() => queue.hasNext),
    hasPrevious: computed(() => queue.hasPrevious),
    
    // Settings
    crossfadeDuration: computed({
      get: () => player.crossfadeDuration,
      set: (val: number) => player.setCrossfadeDuration(val)
    }),

    // --- Actions ---
    
    play: (track: any, index?: number) => {
      // If we're provided a track list context from somewhere else, that should update queue
      // Otherwise just play single track through queue
      if (typeof index === 'number') {
        queue.setCurrentIndex(index)
      } else {
        queue.addToQueue(track)
      }
      player.play(track)
    },
    
    pause: () => player.pause(),
    
    toggle: () => player.toggle(),
    
    next: () => queue.next(),
    
    previous: () => queue.previous(),
    
    seek: (percent: number) => player.seekTo(percent),
    
    toggleMute: () => player.toggleMute(),
    
    toggleShuffle: () => queue.toggleShuffle(),
    
    cycleRepeat: () => queue.cycleRepeat()
  }
}
