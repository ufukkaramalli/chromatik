<template>
  <v-card class="pa-3 box-player-card elevation-4">
    <v-row no-gutters align="center">
      <v-col cols="auto" class="mr-4">
        <div class="art-container" :class="{ 'is-playing': playing }">
          <v-img
            :src="current?.art || ''"
            width="48"
            height="48"
            class="rounded-lg track-art"
            cover
          />
        </div>
      </v-col>

      <v-col class="d-flex flex-column justify-center overflow-hidden pr-2">
        <div class="text-truncate font-weight-bold text-body-1 text-white">
          {{ current?.name || '—' }}
        </div>
        <div class="text-truncate text-caption text-white opacity-70">
          {{ current?.user?.name || '' }}
        </div>

        <v-slider
          class="mt-2 progress-slider"
          :model-value="progress"
          @update:model-value="seek"
          density="compact"
          color="primary"
          track-color="rgba(255,255,255,0.2)"
          hide-details
          thumb-size="12"
        />
      </v-col>

      <v-col cols="auto" class="ml-1 d-flex align-center">
        <v-btn icon variant="plain" size="small" class="control-btn" @click="previous">
          <v-icon>mdi-skip-previous</v-icon>
        </v-btn>

        <v-btn 
          icon 
          variant="flat" 
          color="primary" 
          size="small" 
          class="mx-1 play-btn" 
          @click="toggle"
        >
          <v-icon v-if="!playing">mdi-play</v-icon>
          <v-icon v-else>mdi-pause</v-icon>
        </v-btn>

        <v-btn icon variant="plain" size="small" class="control-btn" @click="next">
          <v-icon>mdi-skip-next</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { usePlayer } from '@/composables/usePlayer'

const {
  currentTrack: current,
  isPlaying: playing,
  progress,
  seek,
  next,
  previous,
  toggle,
} = usePlayer()
</script>

<style scoped lang="scss">
.box-player-card {
  background: rgba(18, 18, 18, 0.7) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.opacity-70 {
  opacity: 0.7;
}

.art-container {
  position: relative;
  border-radius: 8px;
  transition: all 0.3s ease;

  &.is-playing {
    box-shadow: 0 0 15px rgba(211, 47, 47, 0.4);
    animation: pulse-glow 2s infinite alternate;
  }
}

@keyframes pulse-glow {
  from { box-shadow: 0 0 10px rgba(211, 47, 47, 0.2); }
  to { box-shadow: 0 0 20px rgba(211, 47, 47, 0.5); }
}

.play-btn {
  background: linear-gradient(135deg, var(--v-primary-base), #B71C1C) !important;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
}

.control-btn {
  color: rgba(255, 255, 255, 0.6) !important;
  transition: color 0.2s ease, transform 0.2s ease;
  &:hover {
    color: white !important;
    transform: scale(1.1);
  }
}

.progress-slider {
  :deep(.v-slider-thumb) {
    transition: transform 0.2s ease;
    transform: scale(0);
  }
  &:hover :deep(.v-slider-thumb) {
    transform: scale(1);
  }
}
</style>