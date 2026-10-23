<template>
  <v-footer v-if="bottomPlayerVisible" app fixed padless class="bottom-player-footer overflow-visible">
    <v-card width="100%" height="100%" tile class="glass-bg overflow-visible">
      
      <!-- Custom Pixel-Perfect Seeker (Preserved) -->
      <div class="custom-seeker" ref="seekerRef" @mousedown="onSeekStart" @click="onSeekClick">
        <div class="seeker-track-bg"></div>
        <div class="seeker-buffer" :style="{ width: Math.min(buffered, 100) + '%' }"></div>
        <div class="seeker-progress" :style="{ width: Math.min(progress, 100) + '%' }"></div>
        <div class="seeker-thumb" :style="{ left: Math.min(progress, 100) + '%' }"></div>
      </div>

      <v-container fluid class="h-100 py-0 px-6 my-3">
        <v-row class="h-100 align-center no-gutters">
          
          <!-- Left: Track Info -->
          <v-col cols="3" class="d-flex align-center pr-4">
            <v-avatar size="56" class="rounded-lg elevation-8 mr-4 flex-shrink-0 cover-avatar ck-art-backing">
              <v-img :src="current?.art ?? ''" alt="Cover" cover draggable="false" />
            </v-avatar>
            <div class="d-flex flex-column overflow-hidden">
              <span class="text-subtitle-2 font-weight-bold text-truncate text-high-emphasis line-height-1">
                <router-link
                  class="routerLink text-decoration-none text-high-emphasis hover-primary"
                  :to="{ name: 'TrackPage', params: { userSlug: current?.user?.slug, trackSlug: current?.name } }"
                >
                  {{ current?.name }}
                </router-link>
              </span>
              <span class="text-caption text-medium-emphasis text-truncate" v-if="current?.user">
                {{ current?.user.name }}
              </span>
            </div>
          </v-col>

          <!-- Center: Integrated Controls + Time -->
          <v-col cols="6" class="d-flex align-center justify-center">
            
            <span class="time-text">{{ formatTime(currentTime) }}</span>

            <div class="controls-group d-flex align-center px-4 mx-4">
              <v-btn icon variant="plain" size="x-small" @click="toggleShuffle" :color="shuffle ? 'primary' : 'medium-emphasis'" class="mx-1">
                <v-icon size="20">mdi-shuffle</v-icon>
              </v-btn>

              <v-btn class="control-btn mx-1" icon variant="plain" size="small" @click="previous" :disabled="!hasPrevious">
                <v-icon size="28">mdi-skip-previous</v-icon>
              </v-btn>

              <v-btn 
                class="play-btn mx-4" 
                icon 
                color="primary"
                size="52"
                @click="toggle"
              >
                <v-progress-circular v-if="isLoading || isBuffering" indeterminate size="24" width="2" color="currentColor" />
                <v-icon size="32" v-else>{{ playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              </v-btn>

              <v-btn class="control-btn mx-1" icon variant="plain" size="small" @click="next" :disabled="!hasNext">
                <v-icon size="28">mdi-skip-next</v-icon>
              </v-btn>

              <v-btn icon variant="plain" size="x-small" @click="cycleRepeat" :color="repeatMode !== 'off' ? 'primary' : 'medium-emphasis'" class="mx-1">
                <v-icon size="20">{{ repeatMode === 'one' ? 'mdi-repeat-once' : 'mdi-repeat' }}</v-icon>
              </v-btn>
            </div>

            <span class="time-text">{{ formatTime(duration) }}</span>

          </v-col>

          <!-- Right: Volume & Options -->
          <v-col cols="3" class="d-flex align-center justify-end pl-4">
            <v-btn icon variant="plain" size="small" @click="toggleMute" class="control-btn mr-1">
              <v-icon size="20">{{ isMuted || volume === 0 ? 'mdi-volume-off' : volume < 50 ? 'mdi-volume-medium' : 'mdi-volume-high' }}</v-icon>
            </v-btn>
            
            <div style="width: 100px; max-width: 120px;" class="mr-4">
              <v-slider
                v-model="volume"
                hide-details
                density="compact"
                color="primary"
                track-color="rgba(var(--v-theme-on-surface), 0.12)"
              />
            </div>

            <v-menu location="top end" :close-on-content-click="false" transition="scale-transition" origin="bottom right">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="plain"
                  size="small"
                  :class="['control-btn', { 'active-modifiers-glow': hasActiveModifiers }]"
                  v-bind="props"
                  :title="$t('Player.Settings.Title')"
                >
                  <v-icon size="20">mdi-tune-vertical</v-icon>
                </v-btn>
              </template>
              <v-card class="settings-menu pa-4 elevation-24" width="340">
                <!-- Header -->
                <div class="d-flex align-center justify-space-between mb-3 pb-2 border-b ck-border-subtle">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" color="primary" size="20">mdi-tune</v-icon>
                    <span class="text-subtitle-2 font-weight-bold text-high-emphasis">{{ $t('Player.Settings.Title') }}</span>
                  </div>
                  <v-btn
                    v-if="hasActiveModifiers"
                    variant="text"
                    size="x-small"
                    color="primary"
                    class="px-2 font-weight-bold"
                    @click="resetAllModifiers"
                  >
                    {{ $t('Player.Settings.ResetAll') }}
                  </v-btn>
                </div>

                <!-- 1. Tempo / BPM Control -->
                <div class="setting-item mb-4">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-1 opacity-70">mdi-metronome</v-icon>
                      <span class="text-caption font-weight-bold">{{ $t('Player.Settings.Tempo') }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <span v-if="current?.bpm" class="text-caption font-weight-bold text-primary mr-1">
                        {{ effectiveBpm }} {{ $t('Player.Settings.CalculatedBpm') }}
                      </span>
                      <span class="text-caption font-weight-bold" :class="{ 'text-primary': playbackRate !== 1 }">
                        ({{ formatSpeedLabel(playbackRate) }})
                      </span>
                      <v-btn
                        v-if="playbackRate !== 1"
                        icon="mdi-refresh"
                        variant="text"
                        size="x-small"
                        class="ml-1 opacity-70 hover-opacity-100"
                        @click="resetSpeed"
                        :title="$t('Player.Settings.Reset')"
                      />
                    </div>
                  </div>

                  <v-slider
                    v-model="playbackRate"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    color="primary"
                    track-color="rgba(var(--v-theme-on-surface), 0.12)"
                    hide-details
                    density="compact"
                    class="mt-1"
                  />

                  <!-- Speed preset chips -->
                  <div class="d-flex justify-space-between mt-2">
                    <v-chip
                      v-for="preset in speedPresets"
                      :key="preset"
                      size="x-small"
                      :variant="Math.abs(playbackRate - preset) < 0.02 ? 'flat' : 'tonal'"
                      :color="Math.abs(playbackRate - preset) < 0.02 ? 'primary' : undefined"
                      class="px-2 cursor-pointer font-weight-bold"
                      @click="playbackRate = preset"
                    >
                      {{ preset === 1.0 ? $t('Player.Settings.Normal') : `${preset}x` }}
                    </v-chip>
                  </div>
                </div>

                <v-divider class="my-3 ck-border-subtle" />

                <!-- 2. Pitch Shift Control -->
                <div class="setting-item mb-4">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-1 opacity-70">mdi-music-accidental-sharp</v-icon>
                      <span class="text-caption font-weight-bold">{{ $t('Player.Settings.PitchShift') }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <span v-if="current?.key" class="text-caption font-weight-bold text-primary mr-1">
                        {{ transposedKey }}
                      </span>
                      <span class="text-caption font-weight-bold" :class="{ 'text-primary': pitchSemitones !== 0 }">
                        ({{ formatPitchLabel(pitchSemitones) }})
                      </span>
                      <v-btn
                        v-if="pitchSemitones !== 0"
                        icon="mdi-refresh"
                        variant="text"
                        size="x-small"
                        class="ml-1 opacity-70 hover-opacity-100"
                        @click="resetPitch"
                        :title="$t('Player.Settings.Reset')"
                      />
                    </div>
                  </div>

                  <!-- Semitone Stepper + Slider -->
                  <div class="d-flex align-center mt-2">
                    <v-btn
                      icon="mdi-minus"
                      variant="tonal"
                      size="x-small"
                      class="mr-2"
                      @click="adjustPitch(-1)"
                      :disabled="pitchSemitones <= PITCH_MIN_SEMITONES"
                    />
                    <v-slider
                      v-model="pitchSemitones"
                      :min="PITCH_MIN_SEMITONES"
                      :max="PITCH_MAX_SEMITONES"
                      step="1"
                      color="primary"
                      track-color="rgba(var(--v-theme-on-surface), 0.12)"
                      hide-details
                      density="compact"
                      class="flex-grow-1"
                    />
                    <v-btn
                      icon="mdi-plus"
                      variant="tonal"
                      size="x-small"
                      class="ml-2"
                      @click="adjustPitch(1)"
                      :disabled="pitchSemitones >= PITCH_MAX_SEMITONES"
                    />
                  </div>
                </div>

                <v-divider class="my-3 ck-border-subtle" />

                <!-- 3. Smart Automix (Apple Music Style Crossfade) -->
                <div class="setting-item">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center cursor-pointer">
                      <v-icon size="16" class="mr-1 text-primary">mdi-auto-fix</v-icon>
                      <span class="text-caption font-weight-bold">{{ $t('Player.Settings.Crossfade') }}</span>
                      <v-icon size="13" class="ml-1 opacity-40">mdi-information-outline</v-icon>
                      <GlassTooltip :text="$t('Player.Settings.CrossfadeDesc')" />
                    </div>
                    <v-switch v-model="crossfadeEnabled" color="primary" hide-details density="compact" />
                  </div>
                </div>

                <v-divider class="my-3 ck-border-subtle" />

                <!-- 4. Loudness Normalization -->
                <div class="setting-item">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center cursor-pointer">
                      <v-icon size="16" class="mr-1 opacity-70">mdi-volume-equal</v-icon>
                      <span class="text-caption font-weight-bold">{{ $t('Player.Settings.Normalization') }}</span>
                      <span
                        v-if="normalizationEnabled && current && normalizationGainDb !== null"
                        class="text-caption font-weight-bold ml-1 text-primary"
                      >
                        ({{ formatGainDb(normalizationGainDb) }})
                      </span>
                      <v-icon size="13" class="ml-1 opacity-40">mdi-information-outline</v-icon>
                      <GlassTooltip>
                        <div>{{ $t('Player.Settings.NormalizationTarget', { target: NORMALIZATION_TARGET_LUFS }) }}</div>
                        <div v-if="normalizationEnabled && current" class="mt-1 d-flex align-center">
                          <span class="opacity-70 mr-1">{{ $t('Player.Settings.NormalizationApplied') }}:</span>
                          <span :class="normalizationGainDb !== null ? 'text-primary font-weight-bold' : 'opacity-70'">
                            {{ normalizationGainDb !== null ? formatGainDb(normalizationGainDb) : $t('Player.Settings.NormalizationNotAnalyzed') }}
                          </span>
                        </div>
                      </GlassTooltip>
                    </div>
                    <v-switch v-model="normalizationEnabled" color="primary" hide-details density="compact" />
                  </div>
                </div>
              </v-card>
            </v-menu>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-footer>
</template>

<script setup lang="ts">
import { usePlayer } from '@/composables/usePlayer'
import { usePlayerStore } from '@/stores/playerStore'
import {
  calculateEffectiveBpm,
  clampPitch,
  formatGainDb,
  formatPitchLabel,
  formatSpeedLabel,
  NORMALIZATION_TARGET_LUFS,
  PITCH_MAX_SEMITONES,
  PITCH_MIN_SEMITONES,
  transposeKey
} from '@/utils/audioMath'
import { formatTime } from '@/utils/format'
import { computed, ref, watch } from 'vue'

const playerStore = usePlayerStore()

const {
  currentTrack: current,
  isPlaying: playing,
  isLoading,
  isBuffering,
  currentTime,
  duration,
  progress,
  buffered,
  volume,
  isMuted,
  seek,
  next,
  previous,
  toggle,
  toggleMute,
  repeatMode,
  shuffle,
  toggleShuffle,
  cycleRepeat,
  hasNext,
  hasPrevious,
  crossfadeDuration,
  playbackRate,
  pitchSemitones,
  hasActiveModifiers,
  resetPlaybackModifiers,
  normalizationEnabled,
  normalizationGainDb
} = usePlayer()

const bottomPlayerVisible = computed(() => playerStore.bottomPlayerVisible)

// Tempo & Pitch Helpers
const speedPresets = [0.8, 0.9, 1.0, 1.1, 1.25]

const effectiveBpm = computed(() => {
  return calculateEffectiveBpm(current.value?.bpm, playbackRate.value)
})

const transposedKey = computed(() => {
  return transposeKey(current.value?.key, pitchSemitones.value)
})

const adjustPitch = (delta: number) => {
  pitchSemitones.value = clampPitch(pitchSemitones.value + delta)
}

const resetPitch = () => {
  pitchSemitones.value = 0
}

const resetSpeed = () => {
  playbackRate.value = 1.0
}

const resetAllModifiers = () => {
  resetPlaybackModifiers()
}

// Custom Seeker Logic
const seekerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const handleSeekPosition = (e: MouseEvent) => {
  if (!seekerRef.value) return
  const rect = seekerRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  seek(percent)
}

const onSeekClick = (e: MouseEvent) => {
  if (isDragging.value) return
  handleSeekPosition(e)
}

const onSeekStart = (e: MouseEvent) => {
  isDragging.value = true
  handleSeekPosition(e)
  
  const onMouseMove = (moveEvent: MouseEvent) => {
    handleSeekPosition(moveEvent)
  }
  
  const onMouseUp = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  
  // Prevent text selection while dragging
  e.preventDefault()
}

// Smart Automix Crossfade State
const crossfadeEnabled = ref(crossfadeDuration.value > 0)

watch(crossfadeEnabled, (enabled) => {
  if (enabled) {
    crossfadeDuration.value = 5 // Activates the smart 2-bar Automix engine
  } else {
    crossfadeDuration.value = 0
  }
})
</script>

<style scoped lang="scss">
.bottom-player-footer {
  height: 88px;
  background: transparent !important;
  z-index: 1000;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  user-select: none;
  -webkit-user-select: none;
}

.cover-avatar {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;

  :deep(img) {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }
}

.glass-bg {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.85)) !important;
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08));
  position: relative;
  border-radius: 0 !important;
}

/* Custom Seeker - Pixel-Perfect & Edge-to-Edge */
.custom-seeker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 16px; 
  margin-top: -8px; 
  z-index: 100;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    .seeker-track-bg, .seeker-buffer, .seeker-progress { height: 6px; }
    .seeker-thumb { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
}

.seeker-track-bg {
  position: absolute;
  width: 100%;
  height: 4px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  transition: height 0.2s ease;
}

.seeker-buffer {
  position: absolute;
  height: 4px;
  background: rgba(var(--v-theme-on-surface), 0.18);
  transition: width 0.3s ease, height 0.2s ease;
  pointer-events: none;
}

.seeker-progress {
  position: absolute;
  height: 4px;
  background: rgb(var(--v-theme-on-surface));
  transition: height 0.2s ease;
  pointer-events: none;
}

.seeker-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: rgb(var(--v-theme-on-surface));
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,0,0, var(--v-shadow-strength, 0.3));
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
  pointer-events: none;
}

.controls-group {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 40px;
  padding: 4px 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08));
}

.time-text {
  font-size: 13px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-family: 'Inter', sans-serif;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
  min-width: 48px;
  text-align: center;
}

.control-btn {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  &:hover:not(:disabled) {
    color: rgb(var(--v-theme-on-surface)) !important;
    transform: translateY(-2px);
  }
}

.play-btn {
  background: rgb(var(--v-theme-primary)) !important;
  color: #ffffff !important;
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 0 24px rgba(var(--v-theme-primary), 0.45) !important;
  }
}

.settings-menu {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), 0.96) !important;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12));
  border-radius: 16px;
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 16px 40px rgba(0, 0, 0, var(--v-shadow-strength, 0.2)) !important;
}

.active-modifiers-glow {
  color: #00e5ff !important;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00e5ff;
    box-shadow: 0 0 8px #00e5ff;
  }
}

.hover-opacity-100 {
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 1 !important;
  }
}

.line-height-1 { line-height: 1.2; }

.hover-primary {
  transition: color 0.2s ease;
  &:hover { color: var(--v-primary-base) !important; }
}

@media (max-width: 960px) {
  .controls-group { padding: 2px 8px; margin-left: 8px !important; margin-right: 8px !important; }
  .time-text { font-size: 11px; min-width: 40px; }
}
</style>
