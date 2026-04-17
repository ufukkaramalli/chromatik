import { watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useQueueStore } from '@/stores/queueStore'

export function useMediaSession() {
  const player = usePlayerStore()
  const queue = useQueueStore()

  // Setup handlers once
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => player.toggle())
    navigator.mediaSession.setActionHandler('pause', () => player.toggle())
    navigator.mediaSession.setActionHandler('previoustrack', () => queue.previous())
    navigator.mediaSession.setActionHandler('nexttrack', () => queue.next())
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && player.duration) {
        player.seekTo((details.seekTime / player.duration) * 100)
      }
    })
  }

  // Keep playback state in sync
  watch(() => player.status, (status) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = status === 'playing' ? 'playing' : 'paused'
    }
  })
}
