<template>
  <v-main class="track-page">
    <div v-if="loading" class="d-flex align-center justify-center fill-height">
      <v-progress-circular size="64" width="6" color="primary" indeterminate></v-progress-circular>
    </div>
    
    <div v-else-if="!success" class="d-flex flex-column align-center justify-center fill-height opacity-50">
      <v-icon size="80" color="grey" class="mb-4">mdi-music-off</v-icon>
      <h2 class="text-h4 font-weight-black text-high-emphasis">{{ $t('Track.NotFound') }}</h2>
    </div>
    
    <div v-else>
      <!-- Hero Banner -->
      <div class="track-hero position-relative d-flex align-center pt-16 pb-16 overflow-hidden">
        
        <!-- Generative Artist Field Background (Inherited from Artist Profile) -->
        <div 
          class="track-hero-waves position-absolute"
          :class="{ 'is-live-pulse': isThisTrackActive && isPlaying }"
        >
          <PillarField v-if="artistTheme === 'pillars'" />
          <FlowField v-else-if="artistTheme === 'flowfield'" />
          <WaveField v-else />
        </div>

        <!-- Abstract blurred background of the track art -->
        <div class="track-hero-bg position-absolute" :style="{ backgroundImage: `url(${track.art || '/no-photo.jpg'})` }"></div>
        <div class="track-hero-overlay position-absolute w-100 h-100"></div>

        <v-container class="position-relative hero-container px-6 px-md-12 pt-6">
          <v-row align="stretch" class="hero-main-row">
            <v-col cols="12" md="auto" class="d-flex justify-center justify-md-start">
              <div class="cover-art-wrap ck-art-backing rounded-xl overflow-hidden position-relative">
                 <v-img :src="track.art || '/no-photo.jpg'" aspect-ratio="1" cover draggable="false">
                    <!-- Always visible Play/Pause button centered on the artwork -->
                    <div class="cover-play-center d-flex align-center justify-center h-100 w-100">
                      <v-btn 
                        icon 
                        color="primary" 
                        class="cover-play-btn"
                        @click="handlePlay"
                      >
                        <v-icon size="38">{{ isThisTrackActive && isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                      </v-btn>
                    </div>
                 </v-img>
              </div>
            </v-col>
            
            <v-col cols="12" md="" class="hero-content-col d-flex flex-column justify-space-between text-center text-md-left mt-6 mt-md-0 pl-md-8">
               <!-- Top Block: Title & Artist (Flush with cover top) -->
               <div class="hero-header-block">
                  <GlitchTitle 
                    :text="track.name" 
                    tag="h1" 
                    className="text-h2 font-weight-black text-high-emphasis track-title mb-1" 
                    :theme="artistTheme"
                  />
                  
                  <div class="text-h5 text-primary font-weight-bold d-flex align-center justify-center justify-md-start cursor-pointer hover-user mb-4" @click="router.push(`/${track.user?.slug || ''}`)">
                     <v-avatar size="36" class="mr-3 elevation-4">
                       <v-img :src="track.user?.photoUrl || '/no-photo-user.jpg'"></v-img>
                     </v-avatar>
                     {{ track.user?.name || $t('Track.UnknownArtist') }}
                  </div>
               </div>

               <!-- Bottom Block: Control Dock & Waveform Stage (Flush with cover bottom) -->
               <div class="hero-lower-block">
                  <!-- Integrated Control & Metadata Dock -->
                  <div
                    class="hero-actions-dock d-flex align-center justify-center justify-md-start flex-wrap mb-3"
                    :style="themeVars"
                  >
                    <!-- Like Button (artist theme coloured, hidden for the owner) -->
                    <v-btn
                      v-if="!isOwner"
                      variant="flat"
                      rounded="pill"
                      size="large"
                      class="px-5 font-weight-bold like-action-btn"
                      :class="{ 'is-liked': isLiked, 'is-popping': likePop }"
                      :aria-label="isLiked ? $t('Player.Card.Unlike') : $t('Player.Card.Like')"
                      :aria-pressed="isLiked"
                      @click="onLikeClick"
                    >
                      <v-icon size="18" class="mr-2 like-heart">{{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                      <span>{{ isLiked ? $t('Track.Liked') : $t('Track.Like') }}</span>
                    </v-btn>
                    <!-- Share Button (Refined Pill) -->
                    <v-btn 
                      variant="tonal" 
                      rounded="pill" 
                      size="large"
                      class="px-5 font-weight-bold glass-action-btn"
                      @click="handleShare"
                    >
                      <v-icon size="18" class="mr-2">mdi-share-variant-outline</v-icon>
                      <span>{{ $t('Track.Share') }}</span>
                    </v-btn>

                    <!-- Unified Audio Specs & Metrics HUD -->
                    <div class="hero-specs-hud d-inline-flex align-center">
                      <div class="hud-item" v-if="track.bpm">
                        <span class="hud-label">BPM</span>
                        <span class="hud-val">{{ track.bpm }}</span>
                      </div>

                      <div class="hud-divider" v-if="track.bpm && track.key"></div>

                      <div class="hud-item" v-if="track.key">
                        <span class="hud-label">KEY</span>
                        <span class="hud-val">{{ track.key }}</span>
                      </div>

                      <div class="hud-divider" v-if="track.bpm || track.key"></div>

                      <div class="hud-item" :title="$t('Track.Plays')">
                        <v-icon size="14" class="mr-1 text-primary">mdi-headphones</v-icon>
                        <span class="hud-val">{{ track.views || 0 }}</span>
                      </div>

                      <div class="hud-divider"></div>

                      <div class="hud-item" :title="$t('Track.Likes')">
                        <v-icon size="14" class="mr-1 text-primary">mdi-heart</v-icon>
                        <span class="hud-val">{{ likeCount }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Seamless Waveform Stage in Hero -->
                  <div class="hero-waveform-stage" v-if="getTrackId(track)">
                    <TrackWaveform 
                      :track="track" 
                      :comments="comments"
                      :seamless="true"
                      @pin-click="handleWaveformPinClick"
                      @seek="handleWaveformSeek"
                    />
                  </div>

                  <!-- Tags -->
                  <div class="d-flex flex-wrap justify-center justify-md-start gap-2 mt-2" v-if="track.tags && track.tags.length">
                     <v-chip v-for="tag in track.tags" :key="tag" variant="outlined" size="small" class="glass-chip font-weight-bold">
                       #{{ tag }}
                     </v-chip>
                  </div>
               </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Main Content -->
      <v-container class="mt-8 mb-12 px-6 px-md-12">
        <v-row>
          <v-col cols="12" md="8">
             <div class="mb-8">
               <h3 class="text-h5 font-weight-black text-high-emphasis mb-6 d-flex align-center">
                 <v-icon color="primary" class="mr-2">mdi-text-box-outline</v-icon>
                 {{ $t('Track.Description') }}
               </h3>
               <div class="glass-card rounded-xl pa-8 text-body-1 text-medium-emphasis description-box">
                  {{ track.description || $t('Track.NoDescription') }}
               </div>
             </div>
             
             <v-row class="mb-8" v-if="(track.genres && track.genres.length) || (track.moods && track.moods.length)">
               <v-col cols="12" sm="6" v-if="track.genres && track.genres.length">
                 <h3 class="text-h5 font-weight-black text-high-emphasis mb-4 d-flex align-center">
                   <v-icon color="primary" class="mr-2">mdi-music-box-multiple</v-icon>
                   {{ $t('Track.Genres') }}
                 </h3>
                 <div class="d-flex flex-wrap gap-2">
                   <v-chip v-for="genre in track.genres" :key="genre" color="primary" variant="tonal" class="font-weight-bold">
                     {{ genre }}
                   </v-chip>
                 </div>
               </v-col>

               <v-col cols="12" sm="6" v-if="track.moods && track.moods.length">
                 <h3 class="text-h5 font-weight-black text-high-emphasis mb-4 d-flex align-center">
                   <v-icon color="primary" class="mr-2">mdi-emoticon</v-icon>
                   {{ $t('Track.Moods') }}
                 </h3>
                 <div class="d-flex flex-wrap gap-2">
                   <v-chip v-for="mood in track.moods" :key="mood" color="secondary" variant="tonal" class="font-weight-bold">
                     {{ mood }}
                   </v-chip>
                 </div>
               </v-col>
             </v-row>

             <!-- Comments Section -->
             <div class="mt-10" v-if="getTrackId(track)">
               <CommentSection 
                 ref="commentSectionRef"
                 target-type="track"
                 :target-id="getTrackId(track)"
                 :owner-id="track.userId || track.user?._id"
                 :track="track"
                 :show-waveform="false"
                 @comments-updated="onCommentsUpdated"
               />
             </div>
          </v-col>
          
          <v-col cols="12" md="4">
             <h3 class="text-h5 font-weight-black text-high-emphasis mb-6 d-flex align-center">
               <v-icon color="primary" class="mr-2">mdi-tag-multiple</v-icon>
               {{ $t('Track.Licenses') }}
             </h3>
             
             <div class="d-flex flex-column gap-4">
                <!-- Basic Lease -->
                <v-card class="glass-card hover-card rounded-xl overflow-hidden border-left-primary" v-if="track.priceBasic !== null && track.priceBasic !== undefined">
                  <v-card-text class="d-flex align-center justify-space-between pa-5">
                    <div>
                      <div class="text-subtitle-1 font-weight-black text-high-emphasis mb-1">{{ $t('Track.BasicLease') }}</div>
                      <div class="text-caption text-medium-emphasis">{{ $t('Track.BasicLeaseDesc') }}</div>
                    </div>
                    <v-btn
                      color="primary"
                      :variant="cartStore.hasItem(track._id || track.id, 'basic') ? 'tonal' : 'flat'"
                      rounded="pill"
                      class="font-weight-black px-6"
                      @click="cartStore.addTrack(track, 'basic')"
                    >
                      <v-icon v-if="cartStore.hasItem(track._id || track.id, 'basic')" start size="16">mdi-check</v-icon>
                      {{ currencyStore.formatPrice(track.priceBasic) }}
                    </v-btn>
                  </v-card-text>
                </v-card>
                
                <!-- Premium Lease -->
                <v-card class="glass-card hover-card rounded-xl overflow-hidden" v-if="track.pricePremium !== null && track.pricePremium !== undefined">
                  <v-card-text class="d-flex align-center justify-space-between pa-5">
                    <div>
                      <div class="text-subtitle-1 font-weight-black text-high-emphasis mb-1">{{ $t('Track.PremiumLease') }}</div>
                      <div class="text-caption text-medium-emphasis">{{ $t('Track.PremiumLeaseDesc') }}</div>
                    </div>
                    <v-btn
                      color="cyan"
                      :variant="cartStore.hasItem(track._id || track.id, 'premium') ? 'tonal' : 'flat'"
                      rounded="pill"
                      class="font-weight-black px-6 text-black"
                      @click="cartStore.addTrack(track, 'premium')"
                    >
                      <v-icon v-if="cartStore.hasItem(track._id || track.id, 'premium')" start size="16">mdi-check</v-icon>
                      {{ currencyStore.formatPrice(track.pricePremium) }}
                    </v-btn>
                  </v-card-text>
                </v-card>
                
                <!-- Unlimited Lease -->
                <v-card class="glass-card hover-card rounded-xl overflow-hidden" v-if="track.priceUnlimited !== null && track.priceUnlimited !== undefined">
                  <v-card-text class="d-flex align-center justify-space-between pa-5">
                    <div>
                      <div class="text-subtitle-1 font-weight-black text-high-emphasis mb-1">{{ $t('Track.UnlimitedLease') }}</div>
                      <div class="text-caption text-medium-emphasis">{{ $t('Track.UnlimitedLeaseDesc') }}</div>
                    </div>
                    <v-btn
                      color="purple"
                      :variant="cartStore.hasItem(track._id || track.id, 'unlimited') ? 'tonal' : 'flat'"
                      rounded="pill"
                      class="font-weight-black px-6"
                      @click="cartStore.addTrack(track, 'unlimited')"
                    >
                      <v-icon v-if="cartStore.hasItem(track._id || track.id, 'unlimited')" start size="16">mdi-check</v-icon>
                      {{ currencyStore.formatPrice(track.priceUnlimited) }}
                    </v-btn>
                  </v-card-text>
                </v-card>
                
                <!-- Exclusive -->
                <v-card class="glass-card hover-card rounded-xl overflow-hidden exclusive-card" v-if="track.priceExclusive !== null && track.priceExclusive !== undefined">
                  <v-card-text class="d-flex align-center justify-space-between pa-5">
                    <div>
                      <div class="text-subtitle-1 font-weight-black text-warning mb-1"><v-icon size="small" class="mr-1">mdi-crown</v-icon>{{ $t('Track.Exclusive') }}</div>
                      <div class="text-caption text-warning-lighten-1">{{ $t('Track.ExclusiveDesc') }}</div>
                    </div>
                    <v-btn
                      color="warning"
                      :variant="cartStore.hasItem(track._id || track.id, 'exclusive') ? 'tonal' : 'flat'"
                      rounded="pill"
                      class="font-weight-black px-6 text-black"
                      @click="cartStore.addTrack(track, 'exclusive')"
                    >
                      <v-icon v-if="cartStore.hasItem(track._id || track.id, 'exclusive')" start size="16">mdi-check</v-icon>
                      {{ currencyStore.formatPrice(track.priceExclusive) }}
                    </v-btn>
                  </v-card-text>
                </v-card>
                
                <div v-if="(track.priceBasic == null) && (track.pricePremium == null) && (track.priceUnlimited == null) && (track.priceExclusive == null)" class="text-center opacity-50 py-4">
                   <v-icon size="32" class="mb-2">mdi-currency-usd-off</v-icon>
                   <div class="text-caption">{{ $t('Track.NoPricing') }}</div>
                </div>
             </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Notification Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      location="top" 
      :timeout="2500" 
      class="mt-4 rounded-lg"
    >
      <div class="d-flex align-center">
        <v-icon start size="20" class="mr-2">mdi-check-circle</v-icon>
        <span class="font-weight-medium">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { usePlayer } from '@/composables/usePlayer'
import { useTrackLike } from '@/composables/useTrackLike'
import { useAppTheme } from '@/composables/useAppTheme'
import { getThemePalette } from '@/utils/themePalette'
import GlitchTitle from '@/components/GlitchTitle.vue'
import TrackWaveform from '@/components/Audio/TrackWaveform.vue'
import CommentSection from '@/components/Comments/CommentSection.vue'
import PillarField from '@/components/PillarField.vue'
import FlowField from '@/components/FlowField.vue'
import WaveField from '@/components/WaveField.vue'
import { getTrackId } from '@/utils/track'
import { useCartStore } from '@/stores/cartStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useSeo } from '@/composables/useSeo'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const { play, toggle, currentTrack, isPlaying } = usePlayer()

const track = ref({})
const success = ref(false)
const loading = ref(true)
const comments = ref([])
const commentSectionRef = ref(null)

// ---------------------------------------------------------------------------
// SEO & Social Media Metadata (Open Graph / Twitter Card)
// ---------------------------------------------------------------------------
const seoTitle = computed(() => {
  if (loading.value) return `Loading Track... | ${appStore.appName}`
  if (!success.value) return `${t('Track.NotFound')} | ${appStore.appName}`
  const artist = track.value.user?.name || t('Track.UnknownArtist')
  return `${track.value.name} by ${artist} | ${appStore.appName}`
})

const seoDescription = computed(() => {
  if (!success.value || !track.value?.name) {
    return 'Listen to music tracks and beats on Chromatik.'
  }
  const artist = track.value.user?.name || 'an artist'
  const bpmStr = track.value.bpm ? `${track.value.bpm} BPM` : ''
  const keyStr = track.value.key ? `Key: ${track.value.key}` : ''
  const tagsStr = track.value.tags?.length ? `(${track.value.tags.slice(0, 3).join(', ')})` : ''
  const details = [bpmStr, keyStr, tagsStr].filter(Boolean).join(' • ')
  return `Listen to "${track.value.name}" by ${artist} on Chromatik. ${details ? `${details}. ` : ''}Stream, license, and download royalty-free.`
})

const seoImage = computed(() => {
  return track.value?.art || ''
})

const canonicalUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const userSlug = track.value?.user?.slug || route.params.userSlug || ''
  const trackSlug = track.value?.slug || route.params.trackSlug || ''
  if (!userSlug || !trackSlug) return ''
  return `${origin}/${userSlug}/${trackSlug}`
})

useSeo({
  title: seoTitle,
  description: seoDescription,
  canonical: canonicalUrl,
  image: seoImage,
  type: ref('music.song')
})

const artistTheme = computed(() => {
  return track.value?.user?.profileTheme || 'ribbons'
})

const isThisTrackActive = computed(() => {
  const activeId = getTrackId(currentTrack.value)
  const thisId = getTrackId(track.value)
  return Boolean(activeId && thisId && activeId === thisId)
})

const { isDark } = useAppTheme()

// Artist palette as CSS vars (see .agents/rules/theme_colors.md)
const themeVars = computed(() => {
  const palette = getThemePalette(artistTheme.value, isDark.value)
  return { '--tp-accent': palette.accent, '--tp-deep': palette.deep }
})

// --- Like ---
const { isLiked, likeCount, isOwner, toggleLike } = useTrackLike(track)
const likePop = ref(false)
let likePopTimer = null

const onLikeClick = () => {
  const willLike = !isLiked.value
  toggleLike()
  if (willLike) {
    // Restart the pop animation even on quick re-likes
    likePop.value = false
    clearTimeout(likePopTimer)
    requestAnimationFrame(() => {
      likePop.value = true
      likePopTimer = setTimeout(() => { likePop.value = false }, 650)
    })
  }
}

onBeforeUnmount(() => clearTimeout(likePopTimer))

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const onCommentsUpdated = (newComments) => {
  comments.value = newComments
}

const handleWaveformPinClick = (comment) => {
  if (commentSectionRef.value) {
    commentSectionRef.value.scrollToComment(comment._id)
  }
}

const handleWaveformSeek = (seconds) => {
  if (commentSectionRef.value) {
    commentSectionRef.value.setPinnedTimestamp(Math.floor(seconds))
  }
}

const handleShare = async () => {
  const shareData = {
    title: track.value?.name || 'Track',
    text: `${track.value?.name} on ${appStore.appName}`,
    url: window.location.href
  }

  if (navigator.share && window.isSecureContext) {
    try {
      await navigator.share(shareData)
      return
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return
      }
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href)
    snackbar.value = {
      show: true,
      text: t('Track.LinkCopied'),
      color: 'success'
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err)
  }
}

const FIND_TRACK = async () => {
  try {
    const response = await appStore.GET_TRACK_PAGE(route.params)
    track.value = response.data
    success.value = true
  } catch (error) {
    console.error(error)
    success.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  FIND_TRACK()
})

const handlePlay = () => {
  const trackId = getTrackId(track.value)
  if (!track.value || !trackId) return;
  const mappedTrack = {
    ...track.value,
    id: trackId,
  }
  
  if (getTrackId(currentTrack.value) === trackId) {
    toggle()
  } else {
    play(mappedTrack)
  }
}
</script>

<style scoped>
.track-page {
  min-height: 100vh;
}
.track-hero {
  min-height: 400px;
  background: #050508;
  border-bottom: 1px solid rgba(255,255,255,0.05);

  .v-theme--light & {
    background: #f8fafc;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
}
/* Generative Artist Background across Hero */
.track-hero-waves {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
  opacity: 0.45;
  contain: strict;
  transition: opacity 0.6s ease;

  &.is-live-pulse {
    opacity: 0.65;
  }
}
.track-hero-bg {
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-size: cover;
  background-position: center;
  filter: blur(90px) saturate(1.4);
  opacity: 0.22;
  z-index: 0;
}
.track-hero-overlay {
  background: radial-gradient(circle at 75% 35%, rgba(5,5,8,0.15) 0%, rgba(5,5,8,0.85) 75%, #050508 100%), linear-gradient(to bottom, rgba(5,5,8,0.15) 0%, #050508 100%);
  z-index: 2;
  pointer-events: none;

  .v-theme--light & {
    background: radial-gradient(circle at 75% 35%, rgba(248,250,252,0.15) 0%, rgba(248,250,252,0.85) 75%, #f8fafc 100%), linear-gradient(to bottom, rgba(248,250,252,0.15) 0%, #f8fafc 100%);
  }
}
.hero-container {
  position: relative;
  z-index: 3;
}
.hero-content-box {
  position: relative;
  z-index: 1;
}
.track-title {
  letter-spacing: -1px;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  line-height: 1.1;
  margin-top: -6px;
}
.glass-card {
  background: rgba(20, 20, 25, 0.6) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;

  .v-theme--light & {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }
}
.hover-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}
.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 12px rgba(var(--v-theme-primary), 0.15) !important;
  border-color: rgba(var(--v-theme-primary), 0.4) !important;

  .v-theme--light & {
    box-shadow: 0 12px 30px rgba(0,0,0,0.08), 0 0 12px rgba(var(--v-theme-primary), 0.15) !important;
  }
}
.border-left-primary {
  border-left: 4px solid rgb(var(--v-theme-primary)) !important;
}
.exclusive-card {
  background: rgba(255, 171, 0, 0.05) !important;
  border: 1px solid rgba(255, 171, 0, 0.2) !important;
}
.exclusive-card:hover {
  border-color: rgba(255, 171, 0, 0.6) !important;
  box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 15px rgba(255, 171, 0, 0.15) !important;
}
.hover-user {
  transition: opacity 0.2s;
}
.hover-user:hover {
  opacity: 0.8;
}
.glass-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);

  .v-theme--light & {
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.08);
  }
}
.glass-chip {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;

  .v-theme--light & {
    background: rgba(0, 0, 0, 0.04) !important;
    border-color: rgba(0, 0, 0, 0.1) !important;
    color: rgb(var(--v-theme-on-surface)) !important;
  }
}
.glass-chip:hover {
  background: rgba(255, 255, 255, 0.1) !important;

  .v-theme--light & {
    background: rgba(0, 0, 0, 0.08) !important;
  }
}
.description-box {
  line-height: 1.8;
  font-size: 1.05rem;
}
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.tracking-wide { letter-spacing: 0.05em; }
.letter-spacing-1 { letter-spacing: 1px; }

/* Integrated Hero Dock & Specs HUD */
.hero-actions-dock {
  gap: 12px;
}

/* Cover Art Play Button */
.cover-play-center {
  position: absolute;
  top: 0;
  left: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.15) 55%, transparent 80%);
  pointer-events: none;
}

.cover-play-btn {
  pointer-events: auto;
  width: 72px !important;
  height: 72px !important;
  border-radius: 50% !important;
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease !important;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.65), 0 0 24px rgba(var(--v-theme-primary), 0.6) !important;
}

.cover-play-btn:hover {
  transform: scale(1.12);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.8), 0 0 32px rgba(var(--v-theme-primary), 0.9) !important;
}

.cover-play-btn:active {
  transform: scale(0.96);
}

.glass-action-btn {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  letter-spacing: 0.5px;
  font-size: 0.825rem;
  transition: all 0.2s ease;
}

.glass-action-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
  transform: translateY(-1px);
}

/* Like button: glass like Share when idle, artist-theme gradient when liked.
   --tp-accent / --tp-deep come from the artist palette (fallback: default red). */
.like-action-btn {
  --tp-accent-fb: var(--tp-accent, 255, 82, 82);
  --tp-deep-fb: var(--tp-deep, 154, 0, 7);
  color: #fff !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  letter-spacing: 0.5px;
  font-size: 0.825rem;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.2s ease !important;
}

.like-action-btn .like-heart {
  color: rgb(var(--tp-accent-fb));
  transition: color 0.2s ease, transform 0.2s ease;
}

.like-action-btn:hover {
  background: rgba(var(--tp-accent-fb), 0.14) !important;
  border-color: rgba(var(--tp-accent-fb), 0.55) !important;
  box-shadow: 0 0 18px rgba(var(--tp-accent-fb), 0.25);
  transform: translateY(-1px);
}

.like-action-btn:hover .like-heart {
  transform: scale(1.15);
}

.like-action-btn.is-liked {
  background: linear-gradient(135deg, rgb(var(--tp-accent-fb)), rgb(var(--tp-deep-fb))) !important;
  border-color: rgba(var(--tp-accent-fb), 0.8) !important;
  box-shadow: 0 6px 22px rgba(var(--tp-accent-fb), 0.4);
}

.like-action-btn.is-liked .like-heart {
  color: #fff;
}

.like-action-btn.is-liked:hover {
  box-shadow: 0 8px 28px rgba(var(--tp-accent-fb), 0.55);
}

.like-action-btn.is-popping {
  animation: like-ring 0.65s ease-out;
}

.like-action-btn.is-popping .like-heart {
  animation: like-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes like-pop {
  0% { transform: scale(1); }
  35% { transform: scale(1.5); }
  60% { transform: scale(0.88); }
  100% { transform: scale(1); }
}

@keyframes like-ring {
  0% { box-shadow: 0 6px 22px rgba(var(--tp-accent-fb), 0.4), 0 0 0 0 rgba(var(--tp-accent-fb), 0.6); }
  100% { box-shadow: 0 6px 22px rgba(var(--tp-accent-fb), 0.4), 0 0 0 16px rgba(var(--tp-accent-fb), 0); }
}

@media (prefers-reduced-motion: reduce) {
  .like-action-btn,
  .like-action-btn .like-heart {
    transition: none !important;
  }
  .like-action-btn.is-popping,
  .like-action-btn.is-popping .like-heart {
    animation: none;
  }
}

.hero-specs-hud {
  padding: 8px 18px;
  border-radius: 9999px;
  background: rgba(22, 22, 28, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  gap: 12px;
  transition: border-color 0.2s ease;

  .v-theme--light & {
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }
}

.hero-specs-hud:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.hud-item {
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  letter-spacing: 0.5px;
}

.hud-label {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
  margin-right: 5px;
  font-size: 0.68rem;

  .v-theme--light & {
    color: rgba(0, 0, 0, 0.45);
  }
}

.hud-val {
  color: #ffffff;
  font-weight: 800;

  .v-theme--light & {
    color: rgb(var(--v-theme-on-surface));
  }
}

.hud-divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.14);

  .v-theme--light & {
    background: rgba(0, 0, 0, 0.1);
  }
}

/* Hero Desktop Alignments */
.hero-main-row {
  align-items: stretch;
}

.cover-art-wrap {
  width: 270px;
  height: 270px;
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;

  .v-theme--light & {
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
  }

  :deep(img) {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }
}

@media (max-width: 959px) {
  .cover-art-wrap {
    width: 100%;
    max-width: 280px;
    height: auto;
    aspect-ratio: 1;
  }
}

@media (min-width: 960px) {
  .hero-content-col {
    height: 270px;
    min-height: 270px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.hero-lower-block {
  width: 100%;
}

.hero-waveform-stage {
  width: 100%;
}
</style>
