import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useQueueStore } from '@/stores/queueStore'

export function useKeyboardShortcuts() {
  const player = usePlayerStore()
  const queue = useQueueStore()

  const handleKeydown = (e: KeyboardEvent) => {
    // Ignore input fields
    const target = e.target as HTMLElement
    if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
      return
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault()
        player.toggle()
        break
      case 'ArrowRight':
        e.preventDefault()
        if (player.duration) {
          const newTime = Math.min(player.currentTime + 5, player.duration)
          player.seekTo((newTime / player.duration) * 100)
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (player.duration) {
          const newTime = Math.max(player.currentTime - 5, 0)
          player.seekTo((newTime / player.duration) * 100)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        player.setVolume(Math.min((player.volume * 100) + 5, 100))
        break
      case 'ArrowDown':
        e.preventDefault()
        player.setVolume(Math.max((player.volume * 100) - 5, 0))
        break
      case 'KeyM':
        e.preventDefault()
        player.toggleMute()
        break
      case 'KeyS':
        e.preventDefault()
        queue.toggleShuffle()
        break
      case 'KeyR':
        e.preventDefault()
        queue.cycleRepeat()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
