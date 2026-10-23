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
            <h2 v-if="title" class="horizon-title font-display text-truncate text-high-emphasis">{{ title }}</h2>
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
                class="font-mono text-caption text-medium-emphasis px-3"
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
      rounded="xl"
      border
      class="text-center py-12 px-4"
    >
      <v-avatar size="54" color="surface-variant" variant="tonal" class="mb-3">
        <v-icon size="28" color="medium-emphasis">mdi-music-note-off</v-icon>
      </v-avatar>
      <div class="text-body-2 font-mono text-medium-emphasis">
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

<style scoped lang="scss" src="./Playlist.scss"></style>