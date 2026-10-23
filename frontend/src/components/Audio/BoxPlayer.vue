<template>
  <!-- Skeleton Loading State -->
  <v-card
    v-if="loading"
    class="pa-3 box-player-card glass-premium"
    border
    elevation="0"
  >
    <div class="player-layout">
      <div class="art-section mb-3">
        <v-skeleton-loader type="image" class="rounded-lg bg-transparent" />
      </div>
      <div class="track-info">
        <v-skeleton-loader type="sentences" class="bg-transparent" />
      </div>
    </div>
  </v-card>

  <v-card
    v-else
    class="pa-3 box-player-card glass-premium"
    :style="themeStyle"
    role="link"
    tabindex="0"
    :aria-label="$t('Player.Card.OpenTrack', { name: trackName, artist: artistName })"
    @click="handleMainClick"
    @keydown.enter.self="handleMainClick"
  >
    <!-- Theme gradient border + spinning neon border on hover -->
    <span class="bp-border" aria-hidden="true"></span>
    <span class="bp-border bp-border--spin" aria-hidden="true"></span>

    <div class="player-layout">
      <!-- Top: Art with Overlay Controls -->
      <!-- .art-section is a static hit area (never transformed) so the tilt can't flicker :hover;
           only the inner .art-stage tilts -->
      <div 
        class="art-section" 
        :class="{ 'is-active': isThisTrackActive }"
        @pointermove="onArtPointerMove"
        @pointerleave="onArtPointerLeave"
      >
        <div class="art-stage ck-art-backing">
          <v-img
            v-if="hasArt"
            :src="displayTrack?.art"
            :alt="$t('Player.Card.CoverAlt', { name: trackName, artist: artistName })"
            width="100%"
            class="track-art"
            aspect-ratio="1"
            cover
            draggable="false"
            @error="artFailed = true"
          />
          <!-- Fallback when the track has no (or a broken) cover -->
          <div
            v-else
            class="art-fallback"
            role="img"
            :aria-label="$t('Player.Card.CoverAlt', { name: trackName, artist: artistName })"
          >
            <v-icon size="48">mdi-music-note</v-icon>
          </div>
  
          <!-- Hover FX: chromatic split ghosts, cursor spotlight, scanlines (decorative) -->
          <template v-if="hasArt">
            <span class="art-fx art-chroma art-chroma--a" aria-hidden="true"></span>
            <span class="art-fx art-chroma art-chroma--b" aria-hidden="true"></span>
          </template>
          <span class="art-fx art-spotlight" aria-hidden="true"></span>
          <span class="art-fx art-scanlines" aria-hidden="true"></span>
          
          <!-- Overlay Layer -->
          <div class="art-overlay" @click.stop="handleToggle">
            <!-- Top Left: Buy / License Chip -->
            <div class="overlay-top-left" v-if="minPrice !== null && !isOwner">
              <v-btn
                variant="flat"
                size="x-small"
                rounded="pill"
                class="price-chip-btn text-white font-weight-black px-2"
                :title="$t('Cart.Licenses.ChooseLicense')"
                @click.stop="openLicenseModal"
              >
                <v-icon size="14" class="mr-1" color="primary">mdi-cart-plus</v-icon>
                {{ currencyStore.formatPrice(minPrice) }}
              </v-btn>
            </div>

            <!-- Top Right: Like Button -->
            <div class="overlay-top-right" v-if="!isOwner">
              <v-btn
                icon
                variant="text"
                size="small"
                class="like-btn"
                :class="{ 'is-liked': isLiked }"
                :aria-label="isLiked ? $t('Player.Card.Unlike') : $t('Player.Card.Like')"
                :aria-pressed="isLiked"
                @click.stop="toggleLike"
              >
                <v-icon size="22">{{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
              </v-btn>
            </div>
  
            <!-- Center: Play/Pause -->
            <v-btn
              icon
              variant="flat"
              size="64"
              class="play-overlay-btn"
              :aria-label="isThisTrackActive
                ? $t('Player.Card.Pause', { name: trackName })
                : $t('Player.Card.Play', { name: trackName })"
            >
              <v-progress-circular v-if="isThisTrackLoading" indeterminate size="28" width="3" color="white" />
              <v-icon v-else size="36" color="white">{{ isThisTrackActive ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
  
            <!-- Bottom: Now Playing Indicator -->
            <div v-if="isThisTrackActive" class="now-playing-overlay-badge">
              <div class="sound-wave" aria-hidden="true">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
              </div>
              <span class="text-tiny">{{ $t('Player.NowPlaying') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Info (Clean Metadata) -->
      <div class="info-section">
        <div class="track-meta text-center">
          <div class="text-truncate font-weight-bold text-high-emphasis cursor-pointer">
            <span class="hover-underline">{{ trackName }}</span>
          </div>
          <div 
            class="text-truncate text-caption text-medium-emphasis cursor-pointer"
            @click.stop="goToProfile"
          >
            <span class="hover-underline">{{ artistName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- License Selector Modal -->
    <LicenseSelectorModal
      v-model="showLicenseModal"
      :track="displayTrack"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePlayer } from '@/composables/usePlayer'
import { useTrackLike, type LikeChange } from '@/composables/useTrackLike'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useAppTheme } from '@/composables/useAppTheme'
import LicenseSelectorModal from '@/components/Cart/LicenseSelectorModal.vue'
import type { TrackLike } from '@/types/audio'
import { getTrackId } from '@/utils/track'
import { getThemePalette } from '@/utils/themePalette'

const currencyStore = useCurrencyStore()
const showLicenseModal = ref(false)

const props = defineProps<{
  track?: TrackLike
  loading?: boolean
  /** Artist profile theme ('ribbons' | 'flowfield' | 'pillars'); defaults to track.user.profileTheme */
  theme?: string | null
  /**
   * Optional play handler (e.g. Playlist uses it to set the queue context).
   * Declared as a prop rather than an emit so we can detect whether a parent provided it
   * and otherwise fall back to playing the single track.
   */
  onPlay?: () => void
  /** Optional contextual track list that this track belongs to */
  trackList?: TrackLike[]
  /** Optional index of this track within trackList */
  index?: number
}>()

const emit = defineEmits<{
  (e: 'like-change', payload: LikeChange): void
}>()

const router = useRouter()
const { t } = useI18n()

const {
  currentTrack: globalTrack,
  isPlaying: globalPlaying,
  isLoading,
  isBuffering,
  toggle,
  play,
} = usePlayer()

const displayTrack = computed<TrackLike | null>(() => props.track || globalTrack.value || null)
const trackId = computed(() => getTrackId(displayTrack.value))
const trackName = computed(() => displayTrack.value?.name || t('Player.NothingPlaying'))
const artistName = computed(() => displayTrack.value?.user?.name || t('Player.Artist'))

const minPrice = computed<number | null>(() => {
  const t = displayTrack.value
  if (!t) return null
  const prices = [t.priceBasic, t.pricePremium, t.priceUnlimited, t.priceExclusive].filter(
    (p): p is number => typeof p === 'number' && !isNaN(p) && p > 0
  )
  return prices.length > 0 ? Math.min(...prices) : null
})

function openLicenseModal() {
  showLicenseModal.value = true
}

// --- Cover art (with fallback for missing / broken images) ---
const artFailed = ref(false)
watch(() => displayTrack.value?.art, () => { artFailed.value = false })
const hasArt = computed(() => Boolean(displayTrack.value?.art) && !artFailed.value)

const { isDark } = useAppTheme()

// --- Theme (CSS variables consumed by the scoped styles) ---
const themeStyle = computed(() => {
  const palette = getThemePalette(props.theme ?? displayTrack.value?.user?.profileTheme, isDark.value)
  const style: Record<string, string> = {
    '--bp-accent': palette.accent,
    '--bp-accent2': palette.accent2,
    '--bp-deep': palette.deep
  }
  if (hasArt.value && displayTrack.value?.art) {
    // JSON.stringify yields a safely quoted/escaped CSS string
    style['--bp-art'] = `url(${JSON.stringify(displayTrack.value.art)})`
  }
  return style
})

// --- Pointer tracking for tilt / parallax / spotlight (CSS vars only, no re-render) ---
let pointerFrame = 0

const setPointerVars = (el: HTMLElement, x: number, y: number) => {
  el.style.setProperty('--mx', x.toFixed(3))
  el.style.setProperty('--my', y.toFixed(3))
}

const onArtPointerMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
  cancelAnimationFrame(pointerFrame)
  pointerFrame = requestAnimationFrame(() => setPointerVars(el, x, y))
}

const onArtPointerLeave = (e: PointerEvent) => {
  cancelAnimationFrame(pointerFrame)
  setPointerVars(e.currentTarget as HTMLElement, 0.5, 0.5)
}

onBeforeUnmount(() => cancelAnimationFrame(pointerFrame))

// --- Like / ownership (shared logic) ---
const { isLiked, isOwner, toggleLike } = useTrackLike(displayTrack, {
  onChange: change => emit('like-change', change)
})

// --- Playback state ---
const isThisTrackCurrent = computed(() => {
  const globalId = getTrackId(globalTrack.value)
  return Boolean(trackId.value && globalId && trackId.value === globalId)
})

const isThisTrackActive = computed(() => isThisTrackCurrent.value && globalPlaying.value)

const isThisTrackLoading = computed(() => {
  return isThisTrackCurrent.value && (isLoading.value || isBuffering.value)
})

const handleToggle = () => {
  if (!displayTrack.value) return

  if (isThisTrackCurrent.value) {
    toggle()
  } else if (props.onPlay) {
    props.onPlay()
  } else if (props.trackList && props.trackList.length > 0) {
    play(displayTrack.value, props.index, props.trackList)
  } else {
    play(displayTrack.value)
  }
}

// --- Navigation ---
const handleMainClick = () => {
  const track = displayTrack.value
  if (!track?.user?.slug) return
  router.push({ 
    name: 'TrackPage', 
    params: { 
      userSlug: track.user.slug, 
      // Legacy tracks may lack a slug; the router URL-encodes the name fallback
      trackSlug: track.slug || track.name || ''
    } 
  })
}

const goToProfile = () => {
  if (!displayTrack.value?.user?.slug) return
  router.push({
    name: 'Profile',
    params: { userSlug: displayTrack.value.user.slug }
  })
}
</script>

<style scoped lang="scss" src="./BoxPlayer.scss"></style>

