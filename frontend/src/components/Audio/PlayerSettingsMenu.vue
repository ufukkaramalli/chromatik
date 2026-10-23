<template>
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
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

const {
  currentTrack: current,
  crossfadeDuration,
  playbackRate,
  pitchSemitones,
  hasActiveModifiers,
  resetPlaybackModifiers,
  normalizationEnabled,
  normalizationGainDb
} = usePlayer()

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
.control-btn {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  &:hover:not(:disabled) {
    color: rgb(var(--v-theme-on-surface)) !important;
    transform: translateY(-2px);
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

.cursor-pointer {
  cursor: pointer;
}
</style>
