<template>
  <v-main class="landing-page">
    <!-- Ambient Dynamic Background Lighting Atmosphere -->
    <div class="landing-ambient-bg" aria-hidden="true">
      <div class="ambient-glow glow-top-left"></div>
      <div class="ambient-glow glow-mid-right"></div>
      <div class="ambient-glow glow-bottom-left"></div>
      <div class="cyber-grid-backdrop"></div>
    </div>

    <!-- 1. MONUMENTAL HERO STAGE (Audio-Reactive WaveField & Spotlight) -->
    <HomeHeroSection
      v-model:search-query="searchQuery"
      :featured-track="featuredTrack"
      @search="handleHeroSearch"
      @explore="scrollToSection('streamed-section')"
      @upload="handleUploadClick"
    />

    <!-- 2. KINETIC TICKER MARQUEE STRIP (Full Width) -->
    <MarqueeStrip :items="marqueeItems" class="mb-16" />

    <!-- MAIN CONTENT CONTAINER -->
    <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <!-- 3. POPULAR GENRES SHOWCASE -->
      <HomeGenresSection
        :genre-items="genreItems"
        @select-genre="handleVibeClick"
      />

      <!-- LAZER TRANSITION DIVIDER -->
      <LaserDivider />

      <!-- 4. PRODUCER CAREER SECTION -->
      <HomeProducerSection
        :producer-metrics-count="producerMetricsCount"
        :track-metrics-count="trackMetricsCount"
        :studio-waveform-bars="studioWaveformBars"
      />
    </v-container>

    <!-- 5. IMMERSIVE MID-PAGE CREATOR CALLOUT BANNER -->
    <HomeStudioBanner
      @upload="handleUploadClick"
      @soundkits="handleSoundkitsClick"
    />

    <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <!-- 6. CHAPTER I: "ZİRVEDEKİLER" (MOST STREAMED) -->
      <EditorialShowcase
        id="streamed-section"
        console-position="left"
        color="#D500F9"
        badge-color="purple-accent-3"
        badge-icon="mdi-fire-circle"
        :index-tag="$t('Home.Landing.MostStreamed.IndexTag')"
        header-icon="mdi-pulse"
        :badge="$t('Home.Landing.MostStreamed.Badge')"
        :title="$t('Home.Landing.MostStreamed.Title')"
        :description="$t('Home.Landing.MostStreamed.Desc')"
        action-icon="mdi-broadcast"
        :action-text="$t('Home.Landing.MostStreamed.Action')"
        sound-bars
        :tracks="filteredMostStreamedTracks"
        :loading="isStreamedLoading"
        playlist-icon="mdi-chart-line-variant"
        :playlist-title="$t('players.MostStreamed')"
        :playlist-subtitle="$t('players.Alltimes')"
        v-bind="$attrs"
      />
    </v-container>

    <!-- 7. CHAPTER II: "CANLI RADAR" (LIVE BROADCAST TERMINAL - 24H) -->
    <HomeLiveRadarSection
      :tracks="filteredRecentTracks"
      :loading="isRecentLoading"
      :recent-tracks-count-text="recentTracksCountText"
      v-bind="$attrs"
    />

    <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <!-- 8. CHAPTER III: "TOPLULUK FAVORİLERİ" (MOST LIKED) — Inverted -->
      <EditorialShowcase
        console-position="right"
        color="#FF3D00"
        badge-color="deep-orange"
        badge-icon="mdi-star-face"
        :index-tag="$t('Home.Landing.MostLiked.IndexTag')"
        header-icon="mdi-trophy-variant"
        :badge="$t('Home.Landing.MostLiked.Badge')"
        :title="$t('Home.Landing.MostLiked.Title')"
        :description="$t('Home.Landing.MostLiked.Desc')"
        action-icon="mdi-trophy-outline"
        :action-text="$t('Home.Landing.MostLiked.Action')"
        :tracks="filteredMostLikedTracks"
        :loading="isLikedLoading"
        playlist-icon="mdi-fire"
        :playlist-title="$t('players.MostLiked')"
        :playlist-subtitle="$t('players.Alltimes')"
        v-bind="$attrs"
      />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useHomeDiscovery } from '@/composables/home/useHomeDiscovery'
import HomeHeroSection from '@/components/Home/HomeHeroSection.vue'
import HomeGenresSection from '@/components/Home/HomeGenresSection.vue'
import HomeProducerSection from '@/components/Home/HomeProducerSection.vue'
import HomeStudioBanner from '@/components/Home/HomeStudioBanner.vue'
import HomeLiveRadarSection from '@/components/Home/HomeLiveRadarSection.vue'
import MarqueeStrip from '@/components/MarqueeStrip.vue'
import LaserDivider from '@/components/LaserDivider.vue'
import EditorialShowcase from '@/components/EditorialShowcase.vue'

const {
  searchQuery,
  producerMetricsCount,
  trackMetricsCount,
  marqueeItems,
  genreItems,
  studioWaveformBars,
  featuredTrack,
  filteredRecentTracks,
  recentTracksCountText,
  filteredMostLikedTracks,
  filteredMostStreamedTracks,
  isStreamedLoading,
  isLikedLoading,
  isRecentLoading,
  handleVibeClick,
  scrollToSection,
  handleHeroSearch,
  handleUploadClick,
  handleSoundkitsClick,
  fetchHomeData
} = useHomeDiscovery()

onMounted(() => {
  fetchHomeData()
})
</script>

<style scoped lang="scss">
.landing-page {
  min-height: 100vh;
  position: relative;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* Ambient dynamic background lighting */
.landing-ambient-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .v-theme--light & {
    display: none !important;
  }

  .ambient-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(140px);
    opacity: 0.38;
  }

  .glow-top-left {
    top: -120px;
    left: 8%;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(255, 82, 82, 0.24) 0%, transparent 70%);
  }

  .glow-mid-right {
    top: 32%;
    right: -120px;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(213, 0, 249, 0.16) 0%, transparent 70%);
  }

  .glow-bottom-left {
    bottom: 8%;
    left: -120px;
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(255, 61, 0, 0.18) 0%, transparent 70%);
  }

  .cyber-grid-backdrop {
    position: absolute;
    inset: 0;
    background-size: 44px 44px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
    opacity: 0.8;
  }
}
</style>