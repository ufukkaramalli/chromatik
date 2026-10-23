<template>
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
                  @click="$emit('play')"
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
              :text="track.name || ''" 
              tag="h1" 
              className="text-h2 font-weight-black text-high-emphasis track-title mb-1" 
              :theme="artistTheme"
            />
            
            <div
              class="text-h5 text-primary font-weight-bold d-flex align-center justify-center justify-md-start cursor-pointer hover-user mb-4"
              @click="goToProfile"
            >
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
                @click="$emit('like')"
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
                @click="$emit('share')"
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
            <div class="hero-waveform-stage" v-if="trackId">
              <TrackWaveform 
                :track="track" 
                :comments="comments"
                :seamless="true"
                @pin-click="$emit('waveform-pin', $event)"
                @seek="$emit('waveform-seek', $event)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import GlitchTitle from '@/components/GlitchTitle.vue'
import TrackWaveform from '@/components/Audio/TrackWaveform.vue'
import PillarField from '@/components/Visualizers/PillarField.vue'
import FlowField from '@/components/Visualizers/FlowField.vue'
import WaveField from '@/components/Visualizers/WaveField.vue'
import { getTrackId } from '@/utils/track'
import type { Track } from '@/types/audio'

const props = defineProps<{
  track: Partial<Track>
  artistTheme: string
  isThisTrackActive: boolean
  isPlaying: boolean
  themeVars: Record<string, string>
  isLiked: boolean
  likeCount: number
  isOwner: boolean
  likePop: boolean
  comments: any[]
}>()

defineEmits<{
  (e: 'play'): void
  (e: 'like'): void
  (e: 'share'): void
  (e: 'waveform-pin', comment: any): void
  (e: 'waveform-seek', seconds: number): void
}>()

const router = useRouter()
const trackId = computed(() => getTrackId(props.track))

const goToProfile = () => {
  if (props.track.user?.slug) {
    router.push(`/${props.track.user.slug}`)
  }
}
</script>

<style scoped lang="scss">
.track-hero {
  min-height: 400px;
  background: #050508;
  border-bottom: 1px solid rgba(255,255,255,0.05);

  .v-theme--light & {
    background: #f8fafc;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
}

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

.track-title {
  letter-spacing: -1px;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  line-height: 1.1;
  margin-top: -6px;
}

.hover-user {
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
}

.gap-2 { gap: 8px; }

/* Integrated Hero Dock & Specs HUD */
.hero-actions-dock {
  gap: 12px;
}

/* Cover Art Play Button */
.cover-art-wrap {
  width: 240px;
  height: 240px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (min-width: 960px) {
    width: 260px;
    height: 260px;
  }
}

.cover-play-center {
  position: absolute;
  top: 0;
  left: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.15) 55%, transparent 80%);
  pointer-events: none;
}

.cover-play-btn {
  pointer-events: auto;
  transform: scale(1);
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.5) !important;
  }
}

.like-action-btn {
  background: linear-gradient(135deg, rgba(var(--tp-accent, 255, 82, 82), 0.18), rgba(var(--tp-deep, 154, 0, 7), 0.12)) !important;
  border: 1px solid rgba(var(--tp-accent, 255, 82, 82), 0.45) !important;
  color: rgb(var(--tp-accent, 255, 82, 82)) !important;
  transition: transform 0.2s ease, background 0.25s ease, box-shadow 0.25s ease;

  &.is-liked {
    background: linear-gradient(135deg, rgb(var(--tp-accent, 255, 82, 82)), rgb(var(--tp-deep, 154, 0, 7))) !important;
    color: #ffffff !important;
    border-color: transparent !important;
    box-shadow: 0 6px 20px rgba(var(--tp-accent, 255, 82, 82), 0.45);
  }

  &.is-popping {
    animation: heart-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.glass-action-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;

  .v-theme--light & {
    background: rgba(0, 0, 0, 0.04) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    color: #0f172a !important;
  }
}

.hero-specs-hud {
  background: rgba(20, 20, 25, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 6px 16px;
  gap: 12px;

  .v-theme--light & {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .hud-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .hud-label {
    font-size: 0.65rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
    letter-spacing: 0.05em;
  }

  .hud-val {
    color: rgb(var(--v-theme-on-surface));
  }

  .hud-divider {
    width: 1px;
    height: 14px;
    background: rgba(var(--v-theme-on-surface), 0.12);
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
</style>
