import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useQueueStore } from '@/stores/queueStore'
import { getTrackId } from '@/utils/track'

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
    autoplay: computed({
      get: () => queue.autoplay,
      set: (val: boolean) => { queue.autoplay = val }
    }),
    hasNext: computed(() => queue.hasNext),
    hasPrevious: computed(() => queue.hasPrevious),
    
    // Settings
    crossfadeDuration: computed({
      get: () => player.crossfadeDuration,
      set: (val: number) => player.setCrossfadeDuration(val)
    }),
    playbackRate: computed({
      get: () => player.playbackRate,
      set: (val: number) => player.setPlaybackRate(val)
    }),
    pitchSemitones: computed({
      get: () => player.pitchSemitones,
      set: (val: number) => player.setPitchSemitones(val)
    }),
    hasActiveModifiers: computed(() => player.hasActiveModifiers),
    normalizationEnabled: computed({
      get: () => player.normalizationEnabled,
      set: (val: boolean) => player.setNormalizationEnabled(val)
    }),
    /** Gain applied to the current track (dB), null = off or not analysed */
    normalizationGainDb: computed(() => player.normalizationGainDb),

    // --- Actions ---
    
    play: (track: any, index?: number, trackList?: any[]) => {
      // If a track list context is provided, initialize/switch to the full list
      if (trackList && Array.isArray(trackList) && trackList.length > 0) {
        const targetId = getTrackId(track)
        const targetIdx = typeof index === 'number' && index >= 0
          ? index
          : trackList.findIndex(t => getTrackId(t) === targetId)
        queue.setQueue(trackList, targetIdx >= 0 ? targetIdx : 0)
      } else if (typeof index === 'number') {
        queue.setCurrentIndex(index)
      } else {
        const targetId = getTrackId(track)
        const existingIdx = targetId 
          ? queue.queue.findIndex(item => getTrackId(item.track) === targetId)
          : -1
        
        if (existingIdx !== -1) {
          queue.setCurrentIndex(existingIdx)
        } else {
          queue.addToQueue(track)
        }
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
    
    cycleRepeat: () => queue.cycleRepeat(),

    setPlaybackRate: (rate: number) => player.setPlaybackRate(rate),

    setPitchSemitones: (semitones: number) => player.setPitchSemitones(semitones),

    resetPlaybackModifiers: () => player.resetPlaybackModifiers()
  }
}
