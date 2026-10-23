<template>
  <div class="glass-card rounded-xl pa-5 mb-8 waveform-container position-relative overflow-hidden">
    <div class="d-flex align-center justify-space-between mb-3 text-caption text-medium-emphasis">
      <span class="d-flex align-center">
        <v-icon size="small" color="primary" class="mr-1">mdi-waveform</v-icon>
        <span class="text-high-emphasis font-weight-bold">{{ formatTime(trackCurrentTime) }}</span>
        <span class="mx-1">/</span>
        <span>{{ formatTime(effectiveDuration) }}</span>
      </span>
      <span class="waveform-hint-text d-none d-sm-inline opacity-70">
        {{ $t('Comments.WaveformHint') }}
      </span>
    </div>

    <!-- Waveform Interactive Track -->
    <div 
      class="waveform-bar-wrapper position-relative"
      ref="waveformRef"
      @mousemove="handleWaveformHover"
      @mouseleave="hoverTimestamp = null; hoverPercent = null"
      @click="handleWaveformClick"
    >
      <!-- Background Bars -->
      <div class="waveform-bars d-flex align-center justify-space-between h-100">
        <div 
          v-for="(bar, index) in waveformBars" 
          :key="index"
          class="waveform-bar"
          :class="{ 'is-played': (index / waveformBars.length) <= playbackProgressRatio }"
          :style="{ height: bar + '%' }"
        ></div>
      </div>

      <!-- Playhead Line -->
      <div 
        v-if="isThisTrackActive || trackCurrentTime > 0"
        class="waveform-playhead"
        :style="{ left: (playbackProgressRatio * 100) + '%' }"
      ></div>

      <!-- Hover Indicator -->
      <div 
        v-if="hoverPercent !== null"
        class="waveform-hover-line"
        :style="{ left: hoverPercent + '%' }"
      >
        <span class="hover-time-tag font-weight-bold">{{ formatTime(hoverTimestamp ?? 0) }}</span>
      </div>

      <!-- Comment Pins / Markers on Waveform -->
      <div 
        v-for="comment in timestampedComments" 
        :key="comment._id"
        class="comment-pin-marker"
        :style="{ left: getCommentPinPercent(comment.audioTimestamp ?? 0) + '%' }"
        @click.stop="emit('seek-to-comment', comment)"
      >
        <GlassTooltip location="top" :offset="14">
          <div class="pin-tooltip text-left pa-1">
            <div class="d-flex align-center justify-space-between mb-1 ga-2">
              <span class="font-weight-bold text-high-emphasis text-caption">{{ comment.userId?.name }}</span>
              <span class="font-mono text-caption text-primary font-weight-bold">{{ formatTime(comment.audioTimestamp ?? 0) }}</span>
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ comment.content }}
            </div>
          </div>
        </GlassTooltip>

        <v-avatar size="24" class="pin-avatar shadow-premium">
          <v-img :src="comment.userId?.photoUrl || '/no-photo-user.jpg'" cover />
        </v-avatar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CommentItemData } from '@/types/comment'
import { formatTime } from '@/utils/format'

const props = defineProps<{
  targetId: string
  trackCurrentTime: number
  effectiveDuration: number
  playbackProgressRatio: number
  isThisTrackActive: boolean
  timestampedComments: CommentItemData[]
}>()

const emit = defineEmits<{
  (e: 'waveform-click', percent: number): void
  (e: 'seek-to-comment', comment: CommentItemData): void
}>()

const waveformRef = ref<HTMLElement | null>(null)
const hoverPercent = ref<number | null>(null)
const hoverTimestamp = ref<number | null>(null)

// Generate consistent visual waveform bars based on targetId seed
const waveformBars = computed(() => {
  const barsCount = 75
  const seedStr = props.targetId || 'default-seed'
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
    const envelope = Math.sin(progress * Math.PI)
    const variance = random() * 60 + 20
    const height = Math.min(95, Math.max(15, Math.floor(envelope * variance + 18)))
    bars.push(height)
  }
  return bars
})

const getCommentPinPercent = (timestamp: number) => {
  if (!props.effectiveDuration || props.effectiveDuration <= 0) return 0
  return Math.min(98, Math.max(2, (timestamp / props.effectiveDuration) * 100))
}

const handleWaveformHover = (e: MouseEvent) => {
  if (!waveformRef.value) return
  const rect = waveformRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  hoverPercent.value = percent
  hoverTimestamp.value = (percent / 100) * props.effectiveDuration
}

const handleWaveformClick = (e: MouseEvent) => {
  if (!waveformRef.value) return
  const rect = waveformRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  emit('waveform-click', percent)
}
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
}

.waveform-container {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), 0.8) !important;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, var(--v-shadow-strength, 0.2));
}

.waveform-bar-wrapper {
  height: 64px;
  width: 100%;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px 0;
}

.waveform-bars {
  gap: 3px;
}

.waveform-bar {
  flex: 1;
  background: rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 4px;
  transition: background 0.15s ease, transform 0.15s ease;
  min-width: 2px;

  &.is-played {
    background: linear-gradient(to top, rgba(var(--v-theme-primary), 0.7), rgb(var(--v-theme-primary)));
    box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.3);
  }
}

.waveform-bar-wrapper:hover .waveform-bar {
  opacity: 0.9;
}

.waveform-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.9), 0 0 4px rgb(var(--v-theme-primary));
  pointer-events: none;
  z-index: 4;
}

.waveform-hover-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(var(--v-theme-on-surface), 0.6);
  pointer-events: none;
  z-index: 5;

  .hover-time-tag {
    position: absolute;
    bottom: -22px;
    transform: translateX(-50%);
    font-size: 10px;
    background: rgba(var(--v-glass-bg, var(--v-theme-surface)), 0.9);
    padding: 2px 6px;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
    border: 1px solid rgba(var(--v-border-color), 0.2);
  }
}

.comment-pin-marker {
  position: absolute;
  top: -8px;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 6;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(-50%) scale(1.25);
    z-index: 7;
  }
}

.pin-avatar {
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.6);
}

.shadow-premium {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
</style>
