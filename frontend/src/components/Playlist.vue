<template>
  <div class="playlist-section glass-section">
    <!-- Top glowing ambient highlight -->
    <div class="section-glow-line" aria-hidden="true"></div>

    <!-- Section Header -->
    <div class="playlist-header px-4 pt-4 pb-2 px-sm-6 pt-sm-5 d-flex align-center justify-space-between flex-wrap">
      <div class="d-flex align-center">
        <!-- Icon badge -->
        <div v-if="icon || $slots.icon" class="playlist-icon-wrap mr-3 mr-sm-4">
          <slot name="icon">
            <v-icon :icon="icon" :color="iconColor || 'primary'" size="22" />
          </slot>
        </div>

        <!-- Title & Subtitle / Badge -->
        <div class="playlist-header-text">
          <slot name="title">
            <h2 v-if="title" class="playlist-title text-truncate">{{ title }}</h2>
          </slot>

          <div class="d-flex align-center flex-wrap gap-2 mt-1">
            <slot name="subtitle">
              <span v-if="subtitle" class="playlist-badge">
                <span class="live-dot" aria-hidden="true"></span>
                {{ subtitle }}
              </span>
            </slot>
            <span v-if="badge" class="playlist-badge">
              <span class="live-dot" aria-hidden="true"></span>
              {{ badge }}
            </span>
          </div>
        </div>
      </div>

      <!-- Header Controls: Carousel arrows & View Switcher (No Play All, No Track Count) -->
      <div class="playlist-header-controls d-flex align-center mt-2 mt-sm-0" v-if="tracks && tracks.length > 0">
        <!-- Left / Right scroll navigation (carousel mode) -->
        <template v-if="viewMode === 'carousel'">
          <v-btn
            icon
            variant="tonal"
            size="small"
            class="carousel-nav-btn mr-1.5"
            :aria-label="$t('players.ScrollLeft')"
            @click="scroll('left')"
          >
            <v-icon size="18">mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="tonal"
            size="small"
            class="carousel-nav-btn mr-2"
            :aria-label="$t('players.ScrollRight')"
            @click="scroll('right')"
          >
            <v-icon size="18">mdi-chevron-right</v-icon>
          </v-btn>
        </template>

        <!-- Toggle Carousel / Grid view -->
        <v-btn
          icon
          variant="tonal"
          size="small"
          class="view-toggle-btn"
          :aria-label="viewMode === 'carousel' ? $t('players.ViewModeGrid') : $t('players.ViewModeCarousel')"
          @click="toggleViewMode"
        >
          <v-icon size="16">
            {{ viewMode === 'carousel' ? 'mdi-view-grid-outline' : 'mdi-view-carousel-outline' }}
          </v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Section Body -->
    <div class="playlist-body pa-3 pa-sm-5 position-relative">
      <!-- Loading Skeleton State -->
      <div v-if="isTracksLoading">
        <div v-if="viewMode === 'carousel'" class="carousel-track">
          <div v-for="n in 6" :key="n" class="carousel-card-item">
            <div class="skeleton-card">
              <div class="skeleton-art"></div>
              <div class="skeleton-line skeleton-title"></div>
              <div class="skeleton-line skeleton-artist"></div>
            </div>
          </div>
        </div>
        <v-row v-else dense class="track-grid">
          <v-col v-for="n in 6" :key="n" cols="6" sm="4" md="3" lg="2">
            <div class="skeleton-card">
              <div class="skeleton-art"></div>
              <div class="skeleton-line skeleton-title"></div>
              <div class="skeleton-line skeleton-artist"></div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!tracks || tracks.length === 0"
        class="playlist-empty text-center py-10"
      >
        <div class="empty-icon-wrap mb-3 mx-auto">
          <v-icon size="36" color="grey-darken-1">mdi-music-note-off</v-icon>
        </div>
        <div class="text-body-2 text-grey-lighten-1">
          {{ $t('players.NoTracks') }}
        </div>
      </div>

      <!-- Tracks in Carousel or Grid Mode -->
      <template v-else>
        <!-- Carousel Stream -->
        <div
          v-if="viewMode === 'carousel'"
          ref="scrollRef"
          class="carousel-track"
        >
          <div
            v-for="(track, idx) in tracks"
            :key="getTrackId(track) || idx"
            class="carousel-card-item"
          >
            <BoxPlayer 
              :track="track" 
              :on-play="() => playFromList(track, idx)"
              @play="() => playFromList(track, idx)"
            />
          </div>
        </div>

        <!-- Full Grid Layout -->
        <v-row v-else dense class="track-grid">
          <v-col
            v-for="(track, idx) in tracks"
            :key="getTrackId(track) || idx"
            cols="6" sm="4" md="3" lg="2"
          >
            <BoxPlayer 
              :track="track" 
              :on-play="() => playFromList(track, idx)"
              @play="() => playFromList(track, idx)"
            />
          </v-col>
        </v-row>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQueueStore } from '@/stores/queueStore'
import { usePlayer } from '@/composables/usePlayer'
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import type { TrackLike } from '@/types/audio'
import { getTrackId } from '@/utils/track'

const props = withDefaults(
  defineProps<{
    tracks?: TrackLike[] | null
    loading?: boolean
    title?: string
    subtitle?: string
    badge?: string
    icon?: string
    iconColor?: string
    initialViewMode?: 'carousel' | 'grid'
  }>(),
  {
    tracks: null,
    loading: false,
    title: '',
    subtitle: '',
    badge: '',
    icon: '',
    iconColor: 'primary',
    initialViewMode: 'carousel'
  }
)

const queueStore = useQueueStore()
const player = usePlayer()

const viewMode = ref<'carousel' | 'grid'>(props.initialViewMode)
const scrollRef = ref<HTMLElement | null>(null)

const isTracksLoading = computed(() => props.loading || props.tracks === null)

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'carousel' ? 'grid' : 'carousel'
}

const scroll = (direction: 'left' | 'right') => {
  if (!scrollRef.value) return
  const scrollAmount = 480
  scrollRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

const playFromList = (track: any, index: number) => {
  if (!props.tracks || props.tracks.length === 0) return
  queueStore.setQueue(props.tracks as any[], index)
  player.play(track, index)
}
</script>

<style scoped lang="scss">
.glass-section {
  position: relative;
  isolation: isolate;
  background: linear-gradient(175deg, rgba(24, 24, 30, 0.7) 0%, rgba(13, 13, 17, 0.85) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: rgba(255, 82, 82, 0.22);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  }
}

.section-glow-line {
  position: absolute;
  top: 0;
  left: 6%;
  right: 6%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 82, 82, 0.4), transparent);
  pointer-events: none;
}

.playlist-header {
  position: relative;
  z-index: 1;
}

.playlist-body {
  position: relative;
  z-index: 2;
}

.playlist-icon-wrap {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(211, 47, 47, 0.22), rgba(211, 47, 47, 0.06));
  border: 1px solid rgba(255, 82, 82, 0.3);
  box-shadow: 0 0 14px rgba(211, 47, 47, 0.18);
}

.playlist-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1.25;

  @media (min-width: 600px) {
    font-size: 1.4rem;
  }
}

.playlist-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #ff5252;
    box-shadow: 0 0 8px #ff5252;
    animation: live-pulse 2s infinite ease-in-out;
  }
}

.carousel-nav-btn, .view-toggle-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.85) !important;
  border-radius: 10px !important;
  width: 32px !important;
  height: 32px !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(211, 47, 47, 0.25) !important;
    border-color: rgba(255, 82, 82, 0.45) !important;
    color: #fff !important;
    transform: translateY(-1px);
    box-shadow: 0 0 12px rgba(255, 82, 82, 0.3);
  }
}

/* Horizontal Carousel */
.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 16px 6px 16px 6px;
  margin-top: -6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 82, 82, 0.25) transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 82, 82, 0.25);
    border-radius: 4px;
    &:hover {
      background: rgba(255, 82, 82, 0.5);
    }
  }
}

.carousel-card-item {
  position: relative;
  z-index: 1;
  flex: 0 0 calc(50% - 10px);
  min-width: 150px;
  scroll-snap-align: start;
  transition: z-index 0.2s;

  &:hover,
  &:focus-within {
    z-index: 20;
  }

  @media (min-width: 600px) {
    flex: 0 0 200px;
  }
  @media (min-width: 960px) {
    flex: 0 0 220px;
  }
  @media (min-width: 1280px) {
    flex: 0 0 230px;
  }
}

.track-grid {
  padding-top: 10px;

  :deep(.v-col) {
    position: relative;
    z-index: 1;
    transition: z-index 0.2s;

    &:hover,
    &:focus-within {
      z-index: 20;
    }
  }
}

/* Skeleton Loading */
.skeleton-card {
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.skeleton-art {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.8s infinite;
  margin-bottom: 12px;
}

.skeleton-line {
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.8s infinite;

  &.skeleton-title {
    height: 14px;
    width: 75%;
    margin-bottom: 6px;
  }

  &.skeleton-artist {
    height: 10px;
    width: 45%;
  }
}

/* Empty State */
.empty-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes live-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.85);
  }
}
</style>