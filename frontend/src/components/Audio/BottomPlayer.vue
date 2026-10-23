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

            <PlayerSettingsMenu />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
import { usePlayerStore } from '@/stores/playerStore'
import { formatTime } from '@/utils/format'
import PlayerSettingsMenu from '@/components/Audio/PlayerSettingsMenu.vue'

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
} = usePlayer()

const bottomPlayerVisible = computed(() => playerStore.bottomPlayerVisible)

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
