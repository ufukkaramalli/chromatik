<template>
  <div class="playlist-horizon position-relative">
    <!-- Streamlined Header -->
    <div
      v-if="!hideHeader"
      class="d-flex align-center flex-wrap pb-3 mb-2"
      :class="align === 'right' ? 'justify-end' : 'justify-space-between'"
    >
      <!-- Icon & Titles -->
      <div
        class="d-flex align-center"
        :class="align === 'right' ? 'flex-row-reverse text-right' : ''"
      >
        <!-- Icon badge / slot -->
        <div
          v-if="icon || $slots.icon"
          class="horizon-icon-wrap"
          :class="align === 'right' ? 'ml-3 ml-sm-4' : 'mr-3 mr-sm-4'"
        >
          <slot name="icon">
            <v-icon :icon="icon" :color="iconColor || 'primary'" size="22" />
          </slot>
        </div>

        <!-- Title & Subtitle / Badge -->
        <div :class="align === 'right' ? 'd-flex flex-column align-end' : ''">
          <slot name="title">
            <h2 v-if="title" class="horizon-title font-display text-truncate text-white">{{ title }}</h2>
          </slot>

          <div
            class="d-flex align-center flex-wrap ga-2 mt-1"
            :class="align === 'right' ? 'justify-end' : ''"
          >
            <slot name="subtitle">
              <v-chip
                v-if="subtitle"
                size="x-small"
                variant="outlined"
                class="font-mono text-caption text-grey-lighten-1 px-3"
                rounded="pill"
              >
                <span class="pulse-beacon mr-1" aria-hidden="true"></span>
                {{ subtitle }}
              </v-chip>
            </slot>
            <v-chip
              v-if="badge"
              size="x-small"
              variant="tonal"
              color="primary"
              class="font-mono text-caption font-weight-bold"
              rounded="pill"
            >
              <span class="pulse-beacon mr-1" aria-hidden="true"></span>
              {{ badge }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <v-sheet
      v-if="!isTracksLoading && (!tracks || tracks.length === 0)"
      color="transparent"
      rounded="xl"
      border
      class="text-center py-12 px-4"
    >
      <v-avatar size="54" color="surface-variant" variant="tonal" class="mb-3">
        <v-icon size="28" color="grey-lighten-1">mdi-music-note-off</v-icon>
      </v-avatar>
      <div class="text-body-2 font-mono text-grey-lighten-1">
        {{ $t('players.NoTracks') }}
      </div>
    </v-sheet>

    <!-- Frameless Horizon Stream with Side Carousel Controls -->
    <div v-else class="carousel-stage position-relative">
      <!-- Seamless Edge Vignette / Floor Emergence Shadows -->
      <div
        class="nav-backdrop-fade nav-backdrop-left"
        aria-hidden="true"
      />
      <div
        class="nav-backdrop-fade nav-backdrop-right"
        aria-hidden="true"
      />

      <!-- Floating High-Contrast Carousel Prev Button -->
      <v-btn
        variant="flat"
        class="carousel-nav-btn nav-prev"
        :class="{ 'is-hidden': isAtStart || !canScroll }"
        :style="{ '--btn-accent': iconColor || '#ff5252' }"
        :aria-label="$t('players.ScrollLeft')"
        elevation="8"
        @click="scroll('left')"
      >
        <v-icon size="28">mdi-chevron-left</v-icon>
      </v-btn>

      <!-- Loading State: BoxPlayer handles its own skeleton -->
      <div v-if="isTracksLoading" class="playlist-rail">
        <div v-for="n in 6" :key="n" class="playlist-rail-card">
          <BoxPlayer loading />
        </div>
      </div>

      <!-- Ready Tracks -->
      <template v-else>
        <div
          ref="scrollRef"
          class="playlist-rail"
          @scroll.passive="updateScrollState"
        >
          <div
            v-for="(track, idx) in tracks"
            :key="getTrackId(track) || idx"
            class="playlist-rail-card"
          >
            <BoxPlayer
              :track="track"
              :on-play="() => playFromList(track, idx)"
              @play="() => playFromList(track, idx)"
            />
          </div>
        </div>

        <!-- Laser Scroll Progress Rail -->
        <div v-if="canScroll" class="horizon-progress-track mt-3">
          <div 
            class="horizon-progress-indicator" 
            :style="{ 
              width: `${scrollProgress}%`,
              backgroundColor: iconColor || '#ff5252',
              color: iconColor || '#ff5252'
            }"
          ></div>
        </div>
      </template>

      <!-- Floating High-Contrast Carousel Next Button -->
      <v-btn
        variant="flat"
        class="carousel-nav-btn nav-next"
        :class="{ 'is-hidden': isAtEnd || !canScroll }"
        :style="{ '--btn-accent': iconColor || '#ff5252' }"
        :aria-label="$t('players.ScrollRight')"
        elevation="8"
        @click="scroll('right')"
      >
        <v-icon size="28">mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
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
    align?: 'left' | 'right'
    hideHeader?: boolean
  }>(),
  {
    tracks: null,
    loading: false,
    title: '',
    subtitle: '',
    badge: '',
    icon: '',
    iconColor: 'primary',
    align: 'left',
    hideHeader: false
  }
)

const queueStore = useQueueStore()
const player = usePlayer()

const scrollRef = ref<HTMLElement | null>(null)
const isAtStart = ref(true)
const isAtEnd = ref(false)
const scrollProgress = ref(0)
const canScroll = ref(false)

const isTracksLoading = computed(() => props.loading || props.tracks === null)

const updateScrollState = () => {
  if (!scrollRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollRef.value
  const maxScroll = scrollWidth - clientWidth
  canScroll.value = maxScroll > 15
  isAtStart.value = scrollLeft <= 8
  isAtEnd.value = scrollLeft >= maxScroll - 8
  scrollProgress.value = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)) : 0
}

const scroll = (direction: 'left' | 'right') => {
  if (!scrollRef.value) return
  const scrollAmount = Math.max(300, Math.floor(scrollRef.value.clientWidth * 0.75))
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

onMounted(() => {
  nextTick(updateScrollState)
  setTimeout(updateScrollState, 150)
  setTimeout(updateScrollState, 500)
  window.addEventListener('resize', updateScrollState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScrollState)
})

watch(() => props.tracks, () => {
  nextTick(updateScrollState)
  setTimeout(updateScrollState, 100)
}, { deep: true })
</script>

<style scoped lang="scss">
.playlist-horizon {
  position: relative;
  width: 100%;
}

.horizon-icon-wrap {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.horizon-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.25;

  @media (min-width: 600px) {
    font-size: 1.5rem;
  }
}

.pulse-beacon {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #ff5252;
  box-shadow: 0 0 8px #ff5252;
  animation: beacon-pulse 2s infinite ease-in-out;
}

@keyframes beacon-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.45;
  }
}

.carousel-stage {
  position: relative;
  width: 100%;
}

/* Floating High-Contrast Carousel Navigation Controls */
.carousel-nav-btn {
  position: absolute !important;
  top: 38% !important;
  transform: translateY(-50%) scale(1) !important;
  z-index: 25 !important;
  width: 46px !important;
  height: 46px !important;
  min-width: 46px !important;
  border-radius: 50% !important;
  background: rgba(26, 20, 38, 0.96) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.35) !important;
  color: #ffffff !important;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.85), 0 0 1px rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  cursor: pointer !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  opacity: 0.95;

  :deep(.v-icon) {
    font-size: 28px !important;
    color: #ffffff !important;
  }

  &.nav-prev {
    left: 8px;
  }

  &.nav-next {
    right: 8px;
  }

  &:hover {
    opacity: 1 !important;
    background: var(--btn-accent, #ff5252) !important;
    border-color: #ffffff !important;
    color: #ffffff !important;
    transform: translateY(-50%) scale(1.12) !important;
    box-shadow: 0 0 24px var(--btn-accent, rgba(255, 82, 82, 0.8)), 0 10px 28px rgba(0, 0, 0, 0.9) !important;

    :deep(.v-icon) {
      color: #ffffff !important;
    }
  }

  &:active {
    transform: translateY(-50%) scale(0.96) !important;
  }

  &.is-hidden {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translateY(-50%) scale(0.75) !important;
  }
}

/* Seamless Edge Vignette / Floor Emergence Shadows */
.nav-backdrop-fade {
  position: absolute;
  top: 0;
  bottom: 14px;
  width: 105px;
  pointer-events: none;
  z-index: 15;
  transition: opacity 0.3s ease;

  @media (max-width: 600px) {
    width: 60px;
  }

  &.nav-backdrop-left {
    left: 0;
    background: linear-gradient(
      to right,
      #0c0b10 0%,
      rgba(12, 11, 16, 0.94) 22%,
      rgba(12, 11, 16, 0.72) 48%,
      rgba(12, 11, 16, 0.32) 75%,
      transparent 100%
    );
  }

  &.nav-backdrop-right {
    right: 0;
    background: linear-gradient(
      to left,
      #0c0b10 0%,
      rgba(12, 11, 16, 0.94) 22%,
      rgba(12, 11, 16, 0.72) 48%,
      rgba(12, 11, 16, 0.32) 75%,
      transparent 100%
    );
  }
}

/* Smooth Horizontal Rail */
.playlist-rail {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 8px 8px 14px 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.playlist-rail-card {
  flex: 0 0 auto;
  width: 175px;
  scroll-snap-align: start;

  @media (min-width: 600px) {
    width: 200px;
  }
  @media (min-width: 960px) {
    width: 215px;
  }
  @media (min-width: 1400px) {
    width: 225px;
  }
}

/* Laser Scroll Progress Rail */
.horizon-progress-track {
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
  margin: 0 4px;
}

.horizon-progress-indicator {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.15s ease-out;
  box-shadow: 0 0 10px currentColor;
}
</style>