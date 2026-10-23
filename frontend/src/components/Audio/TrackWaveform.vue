<template>
  <div 
    class="track-waveform-wrapper position-relative"
    :class="{ 
      'track-waveform-seamless': seamless, 
      'track-waveform-card glass-card rounded-xl pa-4': !seamless 
    }"
  >
    <!-- Interactive Waveform Stage -->
    <div 
      class="waveform-interactive-area position-relative"
      ref="waveformRef"
      @mousemove="handleHover"
      @mouseleave="clearHover"
      @click="handleClick"
    >
      <!-- Background & Played Waveform Bars -->
      <div 
        class="waveform-bars-flex d-flex align-end justify-space-between h-100"
        :class="{ 'is-audio-playing': isDancing }"
      >
        <div 
          v-for="(bar, index) in waveformBars" 
          :key="index"
          class="waveform-bar"
          :class="{ 
            'is-played': (index / waveformBars.length) <= playbackProgressRatio,
            'is-live-active': isBarInActiveZone(index)
          }"
          :style="{ 
            height: bar + '%',
            '--bar-delay': getBarDelay(index),
            '--bar-pulse-duration': getBarDuration(index),
            '--eq-scale': getBarEqScale(index)
          }"
        ></div>
      </div>

      <!-- Playhead Line -->
      <div 
        v-if="isThisTrackActive || trackCurrentTime > 0"
        class="waveform-playhead"
        :class="{ 'is-active-pulse': isDancing }"
        :style="{ left: (playbackProgressRatio * 100) + '%' }"
      >
        <div class="playhead-glow-needle"></div>
      </div>

      <!-- Hover Seeker Line & Tooltip -->
      <div 
        v-if="hoverPercent !== null"
        class="waveform-hover-line"
        :style="{ left: hoverPercent + '%' }"
      >
        <span class="hover-tag font-weight-bold">{{ formatTime(hoverTimestamp) }}</span>
      </div>

      <!-- Floating Comment Pins on Waveform -->
      <div 
        v-for="comment in timestampedComments" 
        :key="comment._id"
        class="waveform-comment-pin"
        :style="{ left: getPinPercent(comment.audioTimestamp) + '%' }"
        @click.stop="handlePinClick(comment)"
      >
        <GlassTooltip location="top" :offset="14">
          <div class="pin-tooltip text-left pa-1">
            <div class="d-flex align-center justify-space-between mb-1 ga-2">
              <span class="font-weight-bold text-high-emphasis text-caption">{{ comment.userId?.name }}</span>
              <span class="font-mono text-caption text-primary font-weight-bold">{{ formatTime(comment.audioTimestamp) }}</span>
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ comment.content }}
            </div>
          </div>
        </GlassTooltip>

        <v-avatar size="24" class="pin-avatar elevation-4">
          <v-img :src="comment.userId?.photoUrl || '/no-photo-user.jpg'" cover />
        </v-avatar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
import { formatTime } from '@/utils/format'
import { getTrackId } from '@/utils/track'

interface Props {
  track: any
  comments?: any[]
  seamless?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  comments: () => [],
  seamless: true
})

const emit = defineEmits<{
  (e: 'pin-click', comment: any): void
  (e: 'seek', seconds: number): void
}>()

const { currentTrack, currentTime, duration, isPlaying, play, seek } = usePlayer()

const waveformRef = ref<HTMLElement | null>(null)
const hoverPercent = ref<number | null>(null)
const hoverTimestamp = ref<number | null>(null)
const containerWidth = ref(850)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (waveformRef.value) {
    containerWidth.value = waveformRef.value.clientWidth || 850
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            containerWidth.value = Math.round(entry.contentRect.width)
          }
        }
      })
      resizeObserver.observe(waveformRef.value)
    }
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

const dynamicBarsCount = computed(() => {
  // Sleek bar pitch: 1 bar every 5.5px (roughly 3.5px bar + 2px gap)
  // Large screen 1200px: ~210 bars
  // Medium screen 800px: ~145 bars
  // Mobile screen 400px: ~70 bars
  const calculated = Math.floor(containerWidth.value / 5.5)
  return Math.max(70, Math.min(220, calculated))
})

const isThisTrackActive = computed(() => {
  const activeId = getTrackId(currentTrack.value)
  const targetId = getTrackId(props.track)
  return Boolean(activeId && targetId && activeId === targetId)
})

const isDancing = computed(() => {
  return Boolean(isThisTrackActive.value && isPlaying.value)
})

const currentBarIndex = computed(() => {
  if (!waveformBars.value.length || !isThisTrackActive.value || playbackProgressRatio.value <= 0) return -1
  return Math.min(waveformBars.value.length - 1, Math.floor(playbackProgressRatio.value * waveformBars.value.length))
})

const isBarInActiveZone = (index: number) => {
  if (!isDancing.value || currentBarIndex.value < 0) return false
  return Math.abs(index - currentBarIndex.value) <= 4
}

const getBarEqScale = (index: number) => {
  if (currentBarIndex.value < 0) return 1.0
  const dist = Math.abs(index - currentBarIndex.value)
  if (dist === 0) return 1.28
  if (dist === 1) return 1.22
  if (dist === 2) return 1.16
  if (dist === 3) return 1.10
  if (dist === 4) return 1.05
  return 1.0
}

const getBarDelay = (index: number) => {
  return `${((index % 6) * 0.05).toFixed(2)}s`
}

const getBarDuration = (index: number) => {
  return `${(0.42 + ((index % 5) * 0.07)).toFixed(2)}s`
}

const trackCurrentTime = computed(() => {
  return isThisTrackActive.value ? currentTime.value : 0
})

const effectiveDuration = computed(() => {
  if (isThisTrackActive.value && duration.value > 0) {
    return duration.value
  }
  return props.track?.duration || 180 // Fallback: 3 mins
})

const playbackProgressRatio = computed(() => {
  if (!effectiveDuration.value || effectiveDuration.value <= 0) return 0
  return Math.min(1, Math.max(0, trackCurrentTime.value / effectiveDuration.value))
})

// Realistic audio envelope simulation (responsive bars count)
const waveformBars = computed(() => {
  const barsCount = dynamicBarsCount.value
  const seedStr = props.track?._id || props.track?.name || 'track-seed'
  let seed = 0
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) & 0xffffffff
  }

  const random = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 4294967296
  }

  const bars: number[] = []
  for (let i = 0; i < barsCount; i++) {
    const progress = i / barsCount
    let macroDynamics = 0.5

    // Musical structure: Intro -> Verse -> Build -> Drop/Chorus -> Bridge/Outro
    if (progress < 0.12) {
      macroDynamics = 0.25 + (progress / 0.12) * 0.35 // Intro crescendo
    } else if (progress < 0.35) {
      macroDynamics = 0.55 + Math.sin((progress - 0.12) * 15) * 0.15 // Verse
    } else if (progress < 0.45) {
      macroDynamics = 0.70 + (progress - 0.35) * 2.0 // Build-up
    } else if (progress < 0.75) {
      macroDynamics = 0.85 + Math.sin(progress * 25) * 0.12 // Main Drop / Chorus
    } else {
      macroDynamics = 0.65 - ((progress - 0.75) / 0.25) * 0.38 // Outro decrescendo
    }

    const microVariance = random() * 40 - 20
    const calculatedHeight = Math.floor(macroDynamics * 80 + microVariance)
    const height = Math.min(96, Math.max(16, calculatedHeight))
    bars.push(height)
  }
  return bars
})

const timestampedComments = computed(() => {
  return (props.comments || []).filter(c => typeof c.audioTimestamp === 'number' && c.audioTimestamp >= 0)
})

const getPinPercent = (timestamp: number) => {
  if (!effectiveDuration.value || effectiveDuration.value <= 0) return 0
  return Math.min(98, Math.max(2, (timestamp / effectiveDuration.value) * 100))
}

const handleHover = (e: MouseEvent) => {
  if (!waveformRef.value) return
  const rect = waveformRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  hoverPercent.value = percent
  hoverTimestamp.value = (percent / 100) * effectiveDuration.value
}

const clearHover = () => {
  hoverPercent.value = null
  hoverTimestamp.value = null
}

const handleClick = (e: MouseEvent) => {
  if (!waveformRef.value) return
  const rect = waveformRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  const targetSeconds = (percent / 100) * effectiveDuration.value

  emit('seek', targetSeconds)

  if (isThisTrackActive.value) {
    seek(percent)
  } else if (props.track) {
    const mapped = {
      ...props.track,
      id: props.track.id || props.track._id
    }
    play(mapped)
    setTimeout(() => {
      seek(percent)
    }, 150)
  }
}

const handlePinClick = (comment: any) => {
  if (typeof comment.audioTimestamp !== 'number') return
  const targetSeconds = comment.audioTimestamp
  const percent = (targetSeconds / effectiveDuration.value) * 100

  emit('pin-click', comment)

  if (isThisTrackActive.value) {
    seek(percent)
  } else if (props.track) {
    const mapped = {
      ...props.track,
      id: getTrackId(props.track)
    }
    play(mapped)
    setTimeout(() => {
      seek(percent)
    }, 150)
  }
}
</script>

<style scoped lang="scss">
.track-waveform-wrapper {
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
}

.track-waveform-seamless {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 0 12px 0 !important;
}

.track-waveform-card {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
  box-shadow: 0 16px 36px rgba(0, 0, 0, var(--v-shadow-strength, 0.2)), inset 0 1px 0 rgba(var(--v-theme-on-surface), 0.04);
}

.waveform-interactive-area {
  height: 94px;
  width: 100%;
  cursor: pointer;
  padding-top: 14px;
}

.waveform-bars-flex {
  gap: 2px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  padding-bottom: 0;
}

.waveform-bar {
  flex: 1;
  max-width: 3.5px;
  background: rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 2px 2px 0 0;
  transition: background 0.12s ease, opacity 0.12s ease, transform 0.22s ease, box-shadow 0.2s ease;
  min-width: 2px;
  transform-origin: 50% 100%;

  &.is-played {
    background: linear-gradient(180deg, #ff4d6d 0%, rgb(var(--v-theme-primary)) 55%, rgba(var(--v-theme-primary), 0.7) 100%);
    box-shadow: 0 -2px 6px rgba(var(--v-theme-primary), 0.3);
  }
}

.waveform-interactive-area:hover .waveform-bar {
  opacity: 0.95;
  &:not(.is-played) {
    background: rgba(var(--v-theme-on-surface), 0.32);
  }
}

/* LIVE EQUALIZER: Only the active pocket around the playhead needle dances */
.waveform-bar.is-live-active {
  animation: liveEqPlayed var(--bar-pulse-duration, 0.48s) ease-in-out infinite alternate;
  animation-delay: var(--bar-delay, 0s);
  z-index: 2;

  &:not(.is-played) {
    animation-name: liveEqUnplayed;
  }
}

@keyframes liveEqPlayed {
  0% {
    transform: scaleY(1);
    filter: brightness(1);
  }
  100% {
    transform: scaleY(var(--eq-scale, 1.22)); /* Upward only, 100% bottom baseline anchor */
    filter: brightness(1.28);
    box-shadow: 0 -7px 16px rgba(var(--v-theme-primary), 0.85);
  }
}

@keyframes liveEqUnplayed {
  0% {
    transform: scaleY(1);
    opacity: 0.6;
    background: rgba(var(--v-theme-on-surface), 0.25);
  }
  100% {
    transform: scaleY(var(--eq-scale, 1.15)); /* Upward only */
    opacity: 1;
    background: rgba(var(--v-theme-on-surface), 0.55);
    box-shadow: 0 -5px 12px rgba(var(--v-theme-on-surface), 0.25);
  }
}

/* Playhead */
.waveform-playhead {
  position: absolute;
  top: 14px;
  bottom: 0;
  width: 2px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 12px rgba(var(--v-theme-primary), 0.9), 0 0 4px rgb(var(--v-theme-primary));
  pointer-events: none;
  z-index: 4;

  .playhead-glow-needle {
    position: absolute;
    top: -4px;
    left: -3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    box-shadow: 0 0 8px rgb(var(--v-theme-primary));
  }

  &.is-active-pulse .playhead-glow-needle {
    animation: needleActivePulse 1.2s ease-in-out infinite alternate;
  }
}

@keyframes needleActivePulse {
  0% {
    box-shadow: 0 0 6px rgb(var(--v-theme-primary)), 0 0 2px rgb(var(--v-theme-primary));
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 16px rgb(var(--v-theme-primary)), 0 0 6px rgb(var(--v-theme-primary));
    transform: scale(1.28);
  }
}

/* Hover Seeker */
.waveform-hover-line {
  position: absolute;
  top: 14px;
  bottom: 0;
  width: 1px;
  background: rgba(var(--v-theme-on-surface), 0.7);
  pointer-events: none;
  z-index: 5;

  .hover-tag {
    position: absolute;
    top: 2px;
    transform: translateX(-50%);
    font-size: 11px;
    background: rgba(var(--v-glass-bg, var(--v-theme-surface)), 0.92);
    backdrop-filter: blur(8px);
    padding: 2px 7px;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.6);
    box-shadow: 0 4px 12px rgba(0, 0, 0, var(--v-shadow-strength, 0.3));
    pointer-events: none;
    white-space: nowrap;
    font-family: monospace;
  }
}

/* Comment Pins (Anchored at the bottom of the waveform) */
.waveform-comment-pin {
  position: absolute;
  bottom: -12px;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 6;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateX(-50%) scale(1.28);
    z-index: 10;
  }
}

.pin-avatar {
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 0 12px rgba(var(--v-theme-primary), 0.85);
  background: rgb(var(--v-theme-surface));
}
</style>
