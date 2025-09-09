// src/composables/usePlayer.js
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrackStore } from '@/stores/track'

export function usePlayer() {
  const trackStore = useTrackStore()
  const {
    currentTrack,
    audioElement,
    isPlaying,
    currentTrackIndex,
  } = storeToRefs(trackStore)

  const progress = computed(() => {
    const el = audioElement.value
    if (!el || !el.duration) return 0
    return (el.currentTime / el.duration) * 100
  })

  const seek = (val) => {
    const el = audioElement.value
    if (!el || !el.duration) return
    el.currentTime = (val / 100) * el.duration
  }

  const next = () => trackStore.SET_NEXT_TRACK()
  const previous = () => trackStore.SET_PREVIOUS_TRACK()

  const toggle = () => {
    const el = audioElement.value
    if (!el) return
    if (isPlaying.value) {
      el.pause()
      trackStore.SET_IS_PLAYING(false)
    } else {
      trackStore.clickedPlay({
        trackIndex: currentTrackIndex.value,
        track: currentTrack.value,
      })
    }
  }

  return {
    currentTrack,
    audioElement,
    isPlaying,
    progress,
    seek,
    next,
    previous,
    toggle,
  }
}
