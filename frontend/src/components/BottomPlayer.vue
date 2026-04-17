<template>
  <v-footer v-if="bottomPlayerVisible" app fixed padless class="bottom-player-footer">
    <v-card width="100%" height="100%" tile class="glass-bg">
      <!-- Progress Bar (Interactive) -->
      <v-progress-linear
        :buffer-value="buffered"
        stream
        :model-value="progress"
        @update:model-value="seek"
        class="my-0 progress-bar cursor-pointer"
        color="primary"
        height="5"
        background-opacity="0.2"
        style="position: absolute; top: 0; left: 0; width: 100%; z-index: 2;"
      />

      <v-row class="px-6 h-100 align-center no-gutters">
        <!-- Track Info -->
        <v-col cols="3" class="d-flex align-center py-1">
          <v-img
            :src="current?.art ?? ''"
            width="64"
            height="64"
            cover
            class="rounded-lg elevation-2 mr-4"
          />
          <div class="d-flex flex-column overflow-hidden">
            <div class="text-subtitle-1 font-weight-bold text-truncate text-white">
              <router-link
                class="routerLink text-decoration-none text-white hover-primary"
                :title="current?.name"
                :to="{ name: 'TrackPage', params: { user: current?.user?.slug, track: current?.name } }"
                v-if="current?.user"
              >
                {{ current?.name }}
              </router-link>
              <span v-else>{{ current?.name }}</span>
            </div>
            <div class="text-caption text-truncate opacity-70 text-white">
              <router-link 
                class="routerLink text-decoration-none text-white hover-primary" 
                :to="current?.user?.slug"
                v-if="current?.user"
              >
                {{ current?.user.name }}
              </router-link>
            </div>
          </div>
        </v-col>

        <!-- Player Controls -->
        <v-col cols="6" class="d-flex flex-column align-center justify-center">
          <div class="d-flex align-center">
            <!-- Shuffle -->
            <v-btn icon variant="plain" size="small" @click="toggleShuffle" :color="shuffle ? 'primary' : 'rgba(255,255,255,0.6)'">
              <v-icon>mdi-shuffle</v-icon>
            </v-btn>

            <v-btn class="mx-2 control-btn" icon variant="plain" @click="previous" :disabled="!hasPrevious">
              <v-icon>mdi-skip-previous</v-icon>
            </v-btn>

            <v-btn 
              class="mx-2 play-btn elevation-4" 
              icon 
              color="primary"
              size="large"
              @click="toggle"
            >
              <v-progress-circular v-if="isLoading || isBuffering" indeterminate size="24" width="2" color="white" />
              <v-icon v-else-if="!playing">mdi-play</v-icon>
              <v-icon v-else>mdi-pause</v-icon>
            </v-btn>

            <v-btn class="mx-2 control-btn" icon variant="plain" @click="next" :disabled="!hasNext">
              <v-icon>mdi-skip-next</v-icon>
            </v-btn>

            <!-- Repeat -->
            <v-btn icon variant="plain" size="small" @click="cycleRepeat" :color="repeatMode !== 'off' ? 'primary' : 'rgba(255,255,255,0.6)'">
              <v-icon v-if="repeatMode === 'one'">mdi-repeat-once</v-icon>
              <v-icon v-else>mdi-repeat</v-icon>
            </v-btn>
          </div>
          <div class="time-display text-caption opacity-70 text-white mt-1">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </v-col>

        <!-- Volume & Settings -->
        <v-col cols="3" class="d-flex align-center justify-end">
          <v-btn icon variant="plain" size="small" @click="toggleMute" class="control-btn mr-2">
            <v-icon>{{ isMuted || volume === 0 ? 'mdi-volume-off' : volume < 50 ? 'mdi-volume-medium' : 'mdi-volume-high' }}</v-icon>
          </v-btn>
          <div style="width: 100px;" class="mr-4">
            <v-slider
              v-model="volume"
              hide-details
              density="compact"
              color="primary"
              track-color="rgba(255,255,255,0.2)"
            />
          </div>

          <!-- Crossfade Gear Menu -->
          <v-menu location="top end" :close-on-content-click="false" transition="slide-y-reverse-transition">
            <template v-slot:activator="{ props }">
              <v-btn icon variant="plain" size="small" class="control-btn" v-bind="props">
                <v-icon>mdi-cog-outline</v-icon>
                <v-tooltip activator="parent" location="top">Oynatıcı Ayarları</v-tooltip>
              </v-btn>
            </template>
            <v-card class="crossfade-menu pa-4" width="280">
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="primary">mdi-transition-masked</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Oynatıcı Ayarları</span>
              </div>
              
              <v-switch
                v-model="crossfadeEnabled"
                color="primary"
                hide-details
                density="compact"
                class="mb-2"
              >
                <template v-slot:label>
                  <span class="text-body-2">Crossfade</span>
                </template>
              </v-switch>
              
              <v-slider
                v-model="crossfadeSliderValue"
                :disabled="!crossfadeEnabled"
                min="1"
                max="12"
                step="1"
                thumb-label="always"
                color="primary"
                hide-details
                density="comfortable"
                class="mt-2"
              >
                <template v-slot:thumb-label="{ modelValue }">
                  {{ modelValue }}s
                </template>
              </v-slider>
              <div class="text-caption mt-2 opacity-70 text-center">
                Parçalar arası geçiş süresi
              </div>
            </v-card>
          </v-menu>

        </v-col>
      </v-row>
    </v-card>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
import { usePlayerStore } from '@/stores/playerStore'
import { formatTime } from '@/utils/format'

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
  crossfadeDuration
} = usePlayer()

const bottomPlayerVisible = computed(() => playerStore.bottomPlayerVisible)

// Crossfade Local State
const crossfadeEnabled = ref(crossfadeDuration.value > 0)
const crossfadeSliderValue = ref(crossfadeDuration.value > 0 ? crossfadeDuration.value : 5) 

watch(crossfadeEnabled, (enabled) => {
  if (enabled) {
    crossfadeDuration.value = crossfadeSliderValue.value
  } else {
    crossfadeDuration.value = 0
  }
})

watch(crossfadeSliderValue, (val) => {
  if (crossfadeEnabled.value) {
    crossfadeDuration.value = val
  }
})
</script>

<style scoped lang="scss">
.bottom-player-footer {
  height: 80px;
  background: transparent !important;
}

.glass-bg {
  background: rgba(18, 18, 18, 0.85) !important;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.crossfade-menu {
  background: rgba(24, 24, 24, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
}

.opacity-70 {
  opacity: 0.7;
}

.hover-primary {
  transition: color 0.2s ease;
  &:hover {
    color: var(--v-primary-base) !important;
  }
}

.control-btn {
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    color: white !important;
    transform: scale(1.1);
  }
  &:disabled {
    opacity: 0.3;
  }
}

.play-btn {
  background: linear-gradient(135deg, var(--v-primary-base), #B71C1C) !important;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
}

.progress-bar {
  transition: height 0.2s ease;
  &:hover {
    height: 8px !important;
  }
  :deep(.v-progress-linear__background) {
    background: rgba(255,255,255,0.1);
  }
}

.time-display {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}
</style>