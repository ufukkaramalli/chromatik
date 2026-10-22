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
        <div class="art-stage">
          <v-img
            v-if="hasArt"
            :src="displayTrack?.art"
            :alt="$t('Player.Card.CoverAlt', { name: trackName, artist: artistName })"
            width="100%"
            class="rounded-lg track-art shadow-premium"
            aspect-ratio="1"
            cover
            draggable="false"
            @error="artFailed = true"
          />
          <!-- Fallback when the track has no (or a broken) cover -->
          <div
            v-else
            class="art-fallback rounded-lg shadow-premium"
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
          <div class="text-truncate font-weight-bold text-white cursor-pointer">
            <span class="hover-underline">{{ trackName }}</span>
          </div>
          <div 
            class="text-truncate text-caption text-white opacity-60 cursor-pointer"
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

// --- Theme (CSS variables consumed by the scoped styles) ---
const themeStyle = computed(() => {
  const palette = getThemePalette(props.theme ?? displayTrack.value?.user?.profileTheme)
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

<style scoped lang="scss">
/*
 * Colours come from the artist theme palette via CSS variables set on the card
 * (--bp-accent / --bp-accent2 / --bp-deep as "r, g, b"), see utils/themePalette.ts
 * and .agents/rules/theme_colors.md. Fallbacks = default red (ribbons) palette.
 */
$ease-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);
$ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
$ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

@property --bp-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.box-player-card {
  --bp-accent: 255, 82, 82;
  --bp-accent2: 211, 47, 47;
  --bp-deep: 154, 0, 7;

  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  user-select: none;
  -webkit-user-select: none;
  transition:
    transform 0.5s $ease-smooth,
    box-shadow 0.4s ease,
    background-color 0.4s ease;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgb(var(--bp-accent));
    outline-offset: 2px;
  }
}

.glass-premium {
  // Subtle theme tint instead of neutral grey glass
  background:
    linear-gradient(160deg, rgba(var(--bp-deep), 0.14), rgba(18, 18, 18, 0.55) 45%),
    rgba(15, 15, 15, 0.5) !important;
  // 16px is visually near-identical to 24px but much cheaper with many cards on screen
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 0 !important;
  border-radius: 16px;
}

/* ---------- Border: theme gradient hairline, neon sweep on hover ---------- */
.bp-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  pointer-events: none;
  z-index: 3;
  background: linear-gradient(
    150deg,
    rgba(var(--bp-accent), 0.45),
    rgba(var(--bp-deep), 0.08) 40%,
    rgba(var(--bp-deep), 0.08) 60%,
    rgba(var(--bp-accent2), 0.3)
  );
  // Punch out the middle => only a 1px gradient ring remains
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  transition: opacity 0.4s ease;

  &--spin {
    padding: 1.5px;
    opacity: 0;
    background: conic-gradient(
      from var(--bp-angle),
      transparent 0 50%,
      rgba(var(--bp-deep), 0.9) 62%,
      rgba(var(--bp-accent), 1) 75%,
      rgba(var(--bp-accent2), 0.9) 84%,
      transparent 94%
    );
    animation: bp-spin 3.2s linear infinite;
    animation-play-state: paused;
  }
}

@keyframes bp-spin {
  to { --bp-angle: 360deg; }
}

.player-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---------- Art ---------- */
.art-section {
  --mx: 0.5;
  --my: 0.5;
  position: relative;
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 1;
  // NOTE: never transform this element - it is the stable :hover / pointer hit area

  &.is-active {
    .art-overlay { opacity: 1; }
    .shadow-premium {
      box-shadow: 0 0 30px rgba(var(--bp-accent), 0.4);
    }
  }

  // Keyboard users tabbing into the play / like buttons must see them
  &:focus-within .art-overlay { opacity: 1; }
}

// The visual layer that tilts (clips the image + fx + controls)
.art-stage {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: hidden;
  isolation: isolate; // keep blend modes inside the cover (no flicker with the glass backdrop)
  backface-visibility: hidden;
  transition: transform 0.6s $ease-out-expo;
  user-select: none;
  -webkit-user-select: none;
}

.track-art {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
  will-change: scale, translate;
  scale: 1;
  translate: 0 0;
  transition:
    scale 0.75s $ease-smooth,
    translate 0.6s $ease-smooth,
    filter 0.6s ease,
    box-shadow 0.3s ease !important;

  :deep(img) {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }
}

.art-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(var(--bp-accent), 0.35),
    rgba(var(--bp-deep), 0.25) 50%,
    rgba(18, 18, 18, 0.9)
  );
  color: rgba(255, 255, 255, 0.5);
  transition: box-shadow 0.3s ease;
}

/* Decorative hover layers (between the image and the controls) */
.art-fx {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  border-radius: 12px;
  transition: opacity 0.35s ease, transform 0.35s $ease-out-expo;
}

// Chromatic split: theme-tinted copies of the cover, screen-blended and offset with the cursor
.art-chroma {
  background-image: var(--bp-art);
  background-size: cover;
  background-position: center;
  background-blend-mode: multiply;
  mix-blend-mode: screen;
  // Same scale as the hovered cover so only the offset animates
  scale: 1;
  translate: 0 0;
  transition: opacity 0.35s ease, scale 0.75s $ease-smooth, translate 0.6s $ease-smooth;

  &--a { background-color: rgb(var(--bp-accent)); }
  &--b { background-color: rgb(var(--bp-accent2)); }
}

// Light that follows the cursor
.art-spotlight {
  background:
    radial-gradient(
      circle at calc(var(--mx) * 100%) calc(var(--my) * 100%),
      rgba(255, 255, 255, 0.22),
      transparent 35%
    ),
    radial-gradient(
      circle at calc(var(--mx) * 100%) calc(var(--my) * 100%),
      rgba(var(--bp-deep), 0.3),
      transparent 60%
    );
  mix-blend-mode: soft-light;
}

// Fine CRT scanlines for the "signal" feel
.art-scanlines {
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.05) 0 1px,
    transparent 1px 3px
  );
  mix-blend-mode: overlay;
}

.art-overlay {
  position: absolute;
  inset: 0;
  background: rgba(8, 8, 12, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.45s $ease-smooth, background 0.45s $ease-smooth;
  z-index: 2;
  border-radius: 12px; 
}

.overlay-top-left {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
}

.price-chip-btn {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.3px;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8) !important;
    border-color: rgba(var(--bp-accent), 0.7) !important;
    transform: scale(1.05);
  }
}

.overlay-top-right {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
}

.like-btn {
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  transition: transform 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  &.is-liked {
    color: rgb(var(--bp-accent));
    box-shadow: 0 0 14px rgba(var(--bp-accent), 0.45);
  }
}

.play-overlay-btn {
  color: #fff !important;
  background: linear-gradient(135deg, rgb(var(--bp-accent)), rgb(var(--bp-accent2))) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  transform: scale(0.7);
  transition: transform 0.3s $ease-bounce, box-shadow 0.3s ease, border-color 0.3s ease;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.65), 0 0 18px rgba(var(--bp-accent), 0.35);
}

@keyframes bp-pulse {
  0% { box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(var(--bp-accent), 0.55); }
  100% { box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 16px rgba(var(--bp-accent), 0); }
}

/* ---------- Hover (mouse devices only) ---------- */
@media (hover: hover) {
  .box-player-card:hover {
    transform: scale(1.015);
    background:
      linear-gradient(160deg, rgba(var(--bp-deep), 0.22), rgba(18, 18, 18, 0.5) 50%),
      rgba(255, 255, 255, 0.06) !important;
    box-shadow:
      0 16px 32px rgba(0, 0, 0, 0.6),
      0 0 24px rgba(var(--bp-accent), 0.18);

    .bp-border { opacity: 0.4; }
    .bp-border--spin {
      opacity: 1;
      animation-play-state: running;
    }

    .art-overlay {
      background: linear-gradient(
        to top,
        rgba(10, 10, 14, 0.88) 0%,
        rgba(var(--bp-deep), 0.42) 50%,
        rgba(10, 10, 14, 0.55) 100%
      );
    }
  }

  .art-section:hover {
    .art-overlay { opacity: 1; }
    .art-spotlight,
    .art-scanlines { opacity: 1; }
  }

  .play-overlay-btn:hover {
    transform: scale(1.1);
    animation: bp-pulse 1.4s ease-out infinite;
  }

  .like-btn:hover { transform: scale(1.15); }
}

// Motion-heavy parts only when the user hasn't asked for reduced motion
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .art-section:hover {
    // Subtle 3D tilt towards the cursor (inner stage only). Slight scale-down keeps the
    // tilted edges inside the card instead of looking sunk into / clipped by it.
    .art-stage {
      transform:
        perspective(1100px)
        rotateX(calc((0.5 - var(--my)) * 4deg))
        rotateY(calc((var(--mx) - 0.5) * 5deg))
        scale(0.98);
      transition: transform 0.15s ease-out;
    }

    // Depth parallax: the cover drifts gently against the tilt with subtle, smooth zoom
    .track-art {
      scale: 1.035;
      translate: calc((0.5 - var(--mx)) * 8px) calc((0.5 - var(--my)) * 8px);
      filter: saturate(1.12) contrast(1.03);
      transition:
        scale 0.65s $ease-smooth,
        translate 0.15s ease-out,
        filter 0.6s ease,
        box-shadow 0.3s ease !important;
    }

    // Chromatic split: ghosts ease apart (no flashing) and trail the cursor
    .art-chroma { opacity: 0.35; }

    .art-chroma--a {
      scale: 1.035;
      translate: calc((0.5 - var(--mx)) * 8px - 3px) calc((0.5 - var(--my)) * 8px);
      transition: scale 0.65s $ease-smooth, translate 0.15s ease-out;
    }

    .art-chroma--b {
      scale: 1.035;
      translate: calc((0.5 - var(--mx)) * 8px + 3px) calc((0.5 - var(--my)) * 8px);
      transition: scale 0.65s $ease-smooth, translate 0.15s ease-out;
    }
  }
}

/* ---------- Now playing ---------- */
.now-playing-overlay-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85),
    rgba(var(--bp-deep), 0.3) 70%,
    transparent
  );
  padding: 14px 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.sound-wave {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 10px;
  
  .bar {
    width: 2px;
    height: 10px;
    background: rgb(var(--bp-accent));
    box-shadow: 0 0 6px rgba(var(--bp-accent), 0.6);
    transform-origin: bottom;
    // transform instead of height: compositor-only, no layout per frame
    animation: wave 0.8s infinite ease-in-out;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes wave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

/* ---------- Touch devices: keep a small, subtle play button visible ---------- */
@media (hover: none) {
  .art-overlay {
    opacity: 1;
    background: transparent;
  }

  .art-section.is-active .art-overlay {
    background: rgba(0, 0, 0, 0.3);
  }

  .play-overlay-btn {
    transform: scale(0.55);
    opacity: 0.9;
  }
}

/* ---------- Meta ---------- */
.info-section {
  display: flex;
  flex-direction: column;
  padding: 2px 4px 6px 4px;
}

.track-meta {
  line-height: 1.4;
  text-transform: uppercase !important;

  .text-caption {
    font-size: 0.75rem !important;
    letter-spacing: 0.08em;
  }
}

.text-tiny {
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #fff;
  opacity: 0.95;
}

.shadow-premium {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.opacity-60 { opacity: 0.6; }

.hover-underline {
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 50% 100%;
  background-repeat: no-repeat;
  background-size: 0% 1px;
  transition: background-size 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-underline:hover {
  background-size: 100% 1px;
}

.cursor-pointer {
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .box-player-card,
  .art-stage,
  .track-art,
  .art-fx,
  .art-overlay,
  .play-overlay-btn,
  .like-btn,
  .shadow-premium,
  .hover-underline {
    transition: none !important;
  }

  .box-player-card:hover { transform: none !important; }
  .bp-border--spin { animation: none !important; }
  .play-overlay-btn:hover { animation: none !important; }

  .sound-wave .bar {
    animation: none;
    transform: scaleY(0.7);
  }
}
</style>
