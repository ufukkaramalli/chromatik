<template>
  <v-main v-cloak class="home-page">
    <v-container class="py-6 py-sm-8 px-3 px-sm-6" style="max-width: 1440px;">
      <!-- Sonic Hero Stage with WaveField & Featured Spotlight -->
      <section class="home-hero position-relative overflow-hidden rounded-2xl mb-10 pa-6 pa-md-10">
        <!-- Audio reactive interactive canvas background -->
        <WaveField class="hero-canvas" />
        <div class="hero-overlay" aria-hidden="true"></div>

        <v-row align="center" class="position-relative z-1">
          <!-- Left: Editorial / Branding Stage -->
          <v-col cols="12" md="7" lg="8" xl="9" class="text-left">
            <div class="hero-badge d-inline-flex align-center px-3 py-1 rounded-pill mb-4">
              <span class="badge-pulse mr-2" aria-hidden="true"></span>
              <v-icon size="15" color="primary" class="mr-1.5">mdi-waveform</v-icon>
              <span class="text-caption font-weight-bold text-uppercase tracking-wider">
                {{ $t('Home.Hero.Badge') }}
              </span>
            </div>

            <GlitchTitle
              :text="$t('Home.Hero.Title')"
              tag="h1"
              className="font-weight-black text-white mb-3 hero-glitch-title"
            />

            <p class="text-body-1 text-grey-lighten-2 hero-subtitle mb-6" style="max-width: 620px;">
              {{ $t('Home.Hero.Subtitle') }}
            </p>

            <!-- Vibe / Mood Explore Pills -->
            <div class="hero-vibes d-flex align-center flex-wrap" style="gap: 8px;">
              <span class="text-caption text-grey-lighten-1 mr-2 font-weight-medium">
                {{ $t('Home.Hero.ExploreGenres') }}:
              </span>
              <v-chip
                v-for="vibe in vibes"
                :key="vibe"
                size="small"
                variant="outlined"
                link
                class="vibe-chip text-caption font-weight-bold"
              >
                {{ vibe }}
              </v-chip>
            </div>
          </v-col>

          <!-- Right: Featured Spotlight Showcase (Standard BoxPlayer) -->
          <v-col v-if="featuredTrack" cols="12" md="5" lg="4" xl="3" class="d-none d-md-flex justify-center justify-md-end">
            <div class="spotlight-card-wrapper position-relative">
              <div class="spotlight-halo" aria-hidden="true"></div>
              <div class="spotlight-tag d-inline-flex align-center px-3 py-1 rounded-pill mb-2">
                <v-icon size="14" color="primary" class="mr-1">mdi-star-four-points</v-icon>
                <span class="text-caption font-weight-bold text-uppercase text-white">
                  {{ $t('Home.Hero.Spotlight') }}
                </span>
              </div>
              <div class="spotlight-player-box">
                <BoxPlayer :track="featuredTrack" />
              </div>
            </div>
          </v-col>
        </v-row>
      </section>

      <!-- 3 Main Curated Sections with Fluid Carousel -->
      <v-row>
        <!-- Recent Tracks -->
        <v-col cols="12" class="mb-8">
          <Playlist
            :tracks="GetRecentTracks"
            :loading="GetRecentTracks === null"
            icon="mdi-clock-time-four-outline"
            icon-color="#FF5252"
            :title="$t('players.Recent')"
            :subtitle="$t('players.Last24')"
            v-bind="$attrs"
          >
            <template #title>
              <h2 class="playlist-section-title text-truncate">{{ $t('players.Recent') }}</h2>
            </template>
            <template #subtitle>
              <span class="playlist-badge">
                <span class="live-dot" aria-hidden="true"></span>
                {{ $t('players.Last24') }}
              </span>
            </template>
          </Playlist>
        </v-col>

        <!-- Most Liked -->
        <v-col cols="12" class="mb-8">
          <Playlist
            :tracks="GetMostLikedTracks"
            :loading="GetMostLikedTracks === null"
            icon="mdi-fire"
            icon-color="#FF3D00"
            :title="$t('players.MostLiked')"
            :subtitle="$t('players.Alltimes')"
            v-bind="$attrs"
          >
            <template #title>
              <h2 class="playlist-section-title text-truncate">{{ $t('players.MostLiked') }}</h2>
            </template>
            <template #subtitle>
              <span class="playlist-badge">
                <span class="live-dot" aria-hidden="true"></span>
                {{ $t('players.Alltimes') }}
              </span>
            </template>
          </Playlist>
        </v-col>

        <!-- Most Streamed -->
        <v-col cols="12" class="mb-8">
          <Playlist
            :tracks="GetMostStreamedTracks"
            :loading="GetMostStreamedTracks === null"
            icon="mdi-chart-line-variant"
            icon-color="#D500F9"
            :title="$t('players.MostStreamed')"
            :subtitle="$t('players.Alltimes')"
            v-bind="$attrs"
          >
            <template #title>
              <h2 class="playlist-section-title text-truncate">{{ $t('players.MostStreamed') }}</h2>
            </template>
            <template #subtitle>
              <span class="playlist-badge">
                <span class="live-dot" aria-hidden="true"></span>
                {{ $t('players.Alltimes') }}
              </span>
            </template>
          </Playlist>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import Playlist from '@/components/Playlist.vue'
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import WaveField from '@/components/WaveField.vue'
import GlitchTitle from '@/components/GlitchTitle.vue'

const app = useAppStore()
const {
  GET_RECENT_TRACKS: GetRecentTracks,
  GET_MOST_LIKED_TRACKS: GetMostLikedTracks,
  GET_MOST_STREAMED_TRACKS: GetMostStreamedTracks
} = storeToRefs(app)

const vibes = ['Trap', 'Lo-Fi', 'Synthwave', 'Hip-Hop', 'Electronic', 'Cyberpunk', 'Ambient']

const featuredTrack = computed(() => {
  return GetMostStreamedTracks.value?.[0] || GetMostLikedTracks.value?.[0] || GetRecentTracks.value?.[0] || null
})

onMounted(() => {
  app.RECENT_TRACKS()
  app.MOST_LIKED()
  app.MOST_STREAMED()
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

.home-hero {
  background: linear-gradient(135deg, rgba(26, 16, 20, 0.75) 0%, rgba(14, 14, 18, 0.9) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 82, 82, 0.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-height: 320px;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.65;
  pointer-events: none;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 75% 40%, rgba(211, 47, 47, 0.15) 0%, transparent 60%),
              linear-gradient(180deg, transparent 40%, rgba(10, 10, 14, 0.85) 100%);
  pointer-events: none;
}

.z-1 {
  z-index: 1;
}

.hero-badge {
  background: rgba(211, 47, 47, 0.15);
  border: 1px solid rgba(255, 82, 82, 0.35);
  color: #ff5252;
  letter-spacing: 1px;
}

.badge-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #ff5252;
  box-shadow: 0 0 10px #ff5252;
  animation: live-pulse 2s infinite ease-in-out;
}

.hero-glitch-title {
  font-size: clamp(1.65rem, 2.5vw, 2.65rem) !important;
  letter-spacing: -0.025em;
  line-height: 1.15;

  @media (min-width: 1200px) {
    white-space: nowrap;
  }
}

.hero-subtitle {
  opacity: 0.85;
  line-height: 1.6;
}

.vibe-chip {
  cursor: pointer !important;
  user-select: none;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.75) !important;
  background: rgba(255, 255, 255, 0.03) !important;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(255, 82, 82, 0.5) !important;
    background: rgba(211, 47, 47, 0.15) !important;
    color: #fff !important;
    transform: translateY(-1px);
  }
}

/* Spotlight featured card */
.spotlight-card-wrapper {
  max-width: 260px;
  width: 100%;
}

.spotlight-halo {
  position: absolute;
  inset: -16px;
  background: radial-gradient(circle, rgba(255, 82, 82, 0.3) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
  border-radius: 24px;
}

.spotlight-tag {
  background: rgba(211, 47, 47, 0.25);
  border: 1px solid rgba(255, 82, 82, 0.45);
  box-shadow: 0 0 12px rgba(211, 47, 47, 0.3);
}

.playlist-section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1.25;

  @media (min-width: 600px) {
    font-size: 1.45rem;
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