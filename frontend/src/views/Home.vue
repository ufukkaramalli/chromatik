<template>
  <v-main v-cloak class="landing-page">
    <!-- Ambient Dynamic Background Lighting Atmosphere -->
    <div class="landing-ambient-bg" aria-hidden="true">
      <div class="ambient-glow glow-top-left"></div>
      <div class="ambient-glow glow-mid-right"></div>
      <div class="ambient-glow glow-bottom-left"></div>
      <div class="cyber-grid-backdrop"></div>
    </div>

    <!-- ============================================================== -->
    <!-- 1. MONUMENTAL HERO STAGE (Audio-Reactive WaveField & Spotlight) -->
    <!-- ============================================================== -->
    <section class="landing-hero position-relative overflow-hidden w-100 pa-6 pa-md-12">
      <!-- Audio reactive interactive canvas background -->
      <WaveField class="hero-canvas" />
      <div class="hero-vignette" aria-hidden="true"></div>

      <v-container class="px-3 px-sm-6 py-0 position-relative z-1" style="max-width: 1480px;">
        <v-row align="center">
          <!-- Left: Narrative & Discovery Stage -->
          <v-col cols="12" lg="7" xl="8" class="text-left pr-lg-6">
            <!-- Micro Status Beacon Chip -->
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              class="font-mono text-caption font-weight-bold text-uppercase tracking-widest mb-5 px-3 py-1"
            >
              <span class="pulse-beacon mr-2" aria-hidden="true"></span>
              <span>{{ $t('Home.Landing.Hero.Badge') }}</span>
              <span class="mx-2 text-grey-darken-1">•</span>
              <span class="text-grey-lighten-1">{{ $t('Home.Landing.Hero.LiveEngine') }}</span>
            </v-chip>

            <!-- Monumental Headline with Outfit & Glitch -->
            <div class="mb-4">
              <GlitchTitle
                :text="$t('Home.Landing.Hero.Title')"
                tag="h1"
                className="hero-headline text-white font-display mb-0"
              />
            </div>

            <!-- Subtitle with Plus Jakarta Sans -->
            <p class="text-body-1 text-grey-lighten-2 hero-narrative font-body mb-6" style="max-width: 640px;">
              {{ $t('Home.Landing.Hero.Subtitle') }}
            </p>

            <!-- Interactive Hero Search Bar (Vuetify v-text-field) -->
            <v-text-field
              v-model="searchQuery"
              :placeholder="$t('Home.Landing.Hero.SearchPlaceholder')"
              prepend-inner-icon="mdi-magnify"
              clearable
              variant="solo"
              flat
              rounded="pill"
              density="comfortable"
              hide-details
              class="hero-search-field mb-7"
              style="max-width: 640px;"
              @keyup.enter="handleHeroSearch"
            >
              <template #append-inner>
                <v-btn
                  color="primary"
                  size="small"
                  rounded="pill"
                  class="font-mono font-weight-bold px-4"
                  elevation="0"
                  @click="handleHeroSearch"
                >
                  {{ $t('Home.Landing.Hero.SearchBtn') }}
                </v-btn>
              </template>
            </v-text-field>

            <!-- Call-To-Action Buttons -->
            <div class="d-flex align-center flex-wrap ga-3">
              <!-- Primary Discovery Button -->
              <v-btn
                size="large"
                color="primary"
                rounded="pill"
                class="font-mono font-weight-bold text-capitalize px-7"
                elevation="4"
                @click="scrollToSection('streamed-section')"
              >
                <v-icon size="20" class="mr-2">mdi-play</v-icon>
                {{ $t('Home.Landing.Hero.Explore') }}
              </v-btn>

              <!-- Secondary Creator Action -->
              <v-btn
                size="large"
                variant="outlined"
                rounded="pill"
                class="font-mono font-weight-bold text-capitalize px-6"
                @click="handleUploadClick"
              >
                <v-icon size="18" color="primary" class="mr-2">mdi-storefront-outline</v-icon>
                {{ $t('Home.Landing.Hero.Upload') }}
              </v-btn>
            </div>
          </v-col>

          <!-- Right: Spotlight Master Showcase (Strict Standard BoxPlayer) -->
          <v-col cols="12" lg="5" xl="4" class="d-flex justify-center justify-lg-end mt-8 mt-lg-0">
            <div class="spotlight-master-deck position-relative w-100" style="max-width: 320px;">
              <div class="spotlight-ambient-glow" aria-hidden="true"></div>

              <!-- Hardware Frame (v-card) -->
              <v-card class="rounded-2xl pa-4 position-relative z-1" elevation="8" border color="#121018">
                <!-- Header Status (Track of the Day Badge & Midnight Countdown) -->
                <div class="d-flex align-center justify-space-between pb-3 mb-3 border-b">
                  <SpotlightBadge />
                  <SpotlightCountdown />
                </div>

                <!-- Standard BoxPlayer (Rule: audio-components.md) -->
                <div class="spotlight-player-container mb-3">
                  <BoxPlayer v-if="featuredTrack" :track="featuredTrack" />
                  <div v-else class="text-center py-8 text-caption text-grey font-body">
                    {{ $t('players.NoTracks') }}
                  </div>
                </div>

                <!-- Hardware Specs Matrix (Tempo / Key / Style) using v-sheet -->
                <v-row dense class="text-center font-mono">
                  <v-col cols="4">
                    <v-sheet rounded="lg" border class="pa-2 bg-surface-light border-opacity-25">
                      <div class="text-caption text-grey-lighten-2 text-uppercase font-weight-medium mb-1" style="font-size: 0.68rem !important;">
                        {{ $t('Home.Landing.Hero.Tempo') }}
                      </div>
                      <div class="text-caption font-weight-bold text-white text-truncate">
                        {{ featuredTrack?.bpm ? `${featuredTrack.bpm} BPM` : $t('Home.Landing.Hero.DefaultBpm') }}
                      </div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="4">
                    <v-sheet rounded="lg" border class="pa-2 bg-surface-light border-opacity-25">
                      <div class="text-caption text-grey-lighten-2 text-uppercase font-weight-medium mb-1" style="font-size: 0.68rem !important;">
                        {{ $t('Home.Landing.Hero.Key') }}
                      </div>
                      <div class="text-caption font-weight-bold text-primary text-truncate">
                        {{ featuredTrack?.key || $t('Home.Landing.Hero.DefaultKey') }}
                      </div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="4">
                    <v-sheet rounded="lg" border class="pa-2 bg-surface-light border-opacity-25">
                      <div class="text-caption text-grey-lighten-2 text-uppercase font-weight-medium mb-1" style="font-size: 0.68rem !important;">
                        {{ $t('Home.Landing.Hero.Style') }}
                      </div>
                      <div class="text-caption font-weight-bold text-white text-truncate">
                        {{ (featuredTrack?.genres && featuredTrack.genres[0]) || $t('Home.Landing.Hero.DefaultStyle') }}
                      </div>
                    </v-sheet>
                  </v-col>
                </v-row>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============================================================== -->
    <!-- 2. KINETIC TICKER MARQUEE STRIP (Full Width)                   -->
    <!-- ============================================================== -->
    <MarqueeStrip :items="marqueeItems" class="mb-16" />

    <!-- ============================================================== -->
    <!-- MAIN CONTENT SECTIONS (Contained to max-width: 1480px)         -->
    <!-- ============================================================== -->
    <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <!-- ============================================================== -->
      <!-- 3. POPULAR GENRES SHOWCASE (BEATSTARS MEETS CYBERPUNK)         -->
      <!-- ============================================================== -->
      <section class="popular-genres-section mb-16 mb-md-24 position-relative">
        <!-- Centered Header Section -->
        <div class="text-center mb-10 d-flex flex-column align-center">
          <v-chip
            size="small"
            variant="tonal"
            color="primary"
            class="font-mono text-caption font-weight-bold text-uppercase tracking-widest mb-3"
            prepend-icon="mdi-music-box-multiple-outline"
          >
            {{ $t('Home.Landing.Genres.Badge') }}
          </v-chip>
          <h2 class="text-h3 font-display font-weight-black text-white mb-2 tracking-tight">
            {{ $t('Home.Landing.Genres.Title') }}
          </h2>
          <p class="text-body-1 font-body text-grey-lighten-2 mb-0" style="max-width: 640px; line-height: 1.6;">
            {{ $t('Home.Landing.Genres.Subtitle') }}
          </p>
        </div>

        <v-row>
          <v-col
            v-for="genre in genreItems"
            :key="genre.name"
            cols="6"
            sm="4"
            md="3"
            lg="auto"
            class="flex-grow-1"
          >
            <v-card
              color="#131018"
              rounded="2xl"
              class="genre-cyber-card pa-5 d-flex flex-column justify-space-between h-100 position-relative overflow-hidden cursor-pointer"
              elevation="4"
              border
              :style="{ '--genre-color': genre.color }"
              @click="handleVibeClick(genre.name)"
            >
              <div
                class="genre-card-bloom"
                :style="{ background: `radial-gradient(circle, ${genre.color}40 0%, transparent 70%)` }"
                aria-hidden="true"
              ></div>

              <!-- Top: Avatar Icon & Launch Arrow -->
              <div class="d-flex align-center justify-space-between mb-5 position-relative z-1">
                <v-avatar
                  size="42"
                  rounded="xl"
                  class="genre-avatar"
                  :style="{
                    background: `${genre.color}15`,
                    border: `1.5px solid ${genre.color}40`
                  }"
                >
                  <v-icon size="22" :style="{ color: genre.color }">{{ genre.icon }}</v-icon>
                </v-avatar>
                <div class="genre-arrow-wrap">
                  <v-icon size="16" class="text-grey-lighten-1 genre-arrow">mdi-arrow-top-right</v-icon>
                </div>
              </div>

              <!-- Bottom: Genre Name & Spec / Sound Characteristic -->
              <div class="position-relative z-1">
                <h3 class="text-body-1 font-display font-weight-black text-white mb-1 tracking-tight">
                  {{ genre.name }}
                </h3>
                <div
                  class="d-flex align-center ga-1 font-mono text-caption text-truncate mb-1"
                  :style="{ color: genre.color, fontSize: '0.72rem !important' }"
                >
                  <span class="font-weight-bold">{{ genre.spec }}</span>
                </div>
                <div class="font-mono text-caption text-grey text-truncate" style="font-size: 0.68rem !important;">
                  {{ genre.sound }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <!-- ============================================================== -->
      <!-- KESKİN LAZER GEÇİŞ ÇİZGİSİ (Vuetify v-divider)                  -->
      <!-- ============================================================== -->
      <LaserDivider />

      <!-- ============================================================== -->
      <!-- 4. PRODUCER CAREER SECTION ("KICKSTART YOUR MUSIC CAREER TODAY") -->
      <!-- ============================================================== -->
      <section class="producer-career-section mb-16 mb-md-24 position-relative">
        <div class="producer-ambient-glow" aria-hidden="true"></div>

        <v-row class="position-relative z-1" align="center">
          <!-- Left Column: Creator Value Pitch & 4 Key Guarantees -->
          <v-col cols="12" lg="7" class="mb-8 mb-lg-0 pr-lg-10">
            <v-chip size="small" variant="tonal" color="primary" class="font-mono text-caption font-weight-bold text-uppercase tracking-widest mb-4" prepend-icon="mdi-account-music-outline">
              {{ $t('Home.Landing.ProducerCareer.Badge') }}
            </v-chip>

            <h2 class="text-h3 font-display font-weight-black text-white mb-4 tracking-tight">
              {{ $t('Home.Landing.ProducerCareer.Title') }}
            </h2>

            <p class="text-body-1 font-body text-grey-lighten-2 mb-8 line-height-relaxed" style="max-width: 640px;">
              {{ $t('Home.Landing.ProducerCareer.Subtitle') }}
            </p>

            <div class="d-flex flex-column ga-4 mb-0">
              <div class="d-flex align-start" v-for="n in 4" :key="n">
                <v-avatar size="28" color="success" variant="tonal" class="mr-3 mt-1 flex-shrink-0">
                  <v-icon size="16">mdi-check-bold</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-body-1 font-display font-weight-bold text-white mb-1">
                    {{ $t(`Home.Landing.ProducerCareer.Point${n}Title`) }}
                  </h3>
                  <p class="text-body-2 font-body text-grey-lighten-2 mb-0">
                    {{ $t(`Home.Landing.ProducerCareer.Point${n}Desc`) }}
                  </p>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Right Column: Studio Showcase Card (v-card) -->
          <v-col cols="12" lg="5">
            <v-card class="producer-studio-card rounded-3xl pa-7 pa-md-8 position-relative overflow-hidden" elevation="8" border color="#131018">
              <div class="studio-card-glow" aria-hidden="true"></div>

              <div class="position-relative z-1">
                <div class="d-flex align-center justify-space-between pb-4 mb-6 border-b">
                  <div class="d-flex align-center ga-3">
                    <span class="studio-live-beacon flex-shrink-0"></span>
                    <span class="font-mono text-caption font-weight-bold text-white tracking-widest text-uppercase">
                      {{ $t('Home.Landing.ProducerCareer.StudioCardTitle') }}
                    </span>
                  </div>
                  <v-icon size="20" color="primary">mdi-shield-check</v-icon>
                </div>

                <div class="mb-6">
                  <p class="text-body-2 font-body text-grey-lighten-2 mb-6 line-height-relaxed">
                    {{ $t('Home.Landing.ProducerCareer.StudioCardSubtitle') }}
                  </p>

                  <!-- Live Metrics Row using v-sheet -->
                  <div class="d-flex flex-column flex-sm-row ga-3">
                    <v-sheet rounded="xl" border class="pa-4 flex-grow-1 bg-surface-light border-opacity-25">
                      <div class="font-mono text-caption text-grey-lighten-2 text-uppercase mb-1">
                        {{ $t('Home.Landing.ProducerCareer.ActiveSellers') }}
                      </div>
                      <div class="text-h5 font-display font-weight-black text-white">
                        {{ producerMetricsCount }}
                      </div>
                    </v-sheet>

                    <v-sheet rounded="xl" border class="pa-4 flex-grow-1 bg-surface-light border-opacity-25">
                      <div class="font-mono text-caption text-grey-lighten-2 text-uppercase mb-1">
                        {{ $t('Home.Landing.ProducerCareer.PublishedTracks') }}
                      </div>
                      <div class="text-h5 font-display font-weight-black text-primary">
                        {{ trackMetricsCount }}
                      </div>
                    </v-sheet>
                  </div>
                </div>

                <!-- Sound Wave Preview Graphic -->
                <div class="pt-4 border-t">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center font-mono text-caption text-grey-lighten-1 font-weight-bold" style="font-size: 0.68rem !important; letter-spacing: 0.08em;">
                      <v-icon size="13" color="#ff5252" class="mr-1">mdi-waveform</v-icon>
                      {{ $t('Home.Landing.ProducerCareer.SpectrumTitle') }}
                    </div>
                    <span class="font-mono text-caption text-primary font-weight-bold" style="font-size: 0.68rem !important; letter-spacing: 0.05em;">
                      {{ $t('Home.Landing.ProducerCareer.AudioQuality') }}
                    </span>
                  </div>

                  <div class="studio-audio-strip d-flex align-end justify-space-between w-100 ga-1">
                    <span
                      v-for="(barHeight, i) in studioWaveformBars"
                      :key="i"
                      class="sound-wave-bar"
                      :style="{
                        height: `${barHeight}%`,
                        animationDelay: `${(i * 0.045).toFixed(2)}s`
                      }"
                    ></span>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </v-container>

    <!-- ============================================================== -->
    <!-- 4. IMMERSIVE MID-PAGE CREATOR CALLOUT BANNER                  -->
    <!-- ============================================================== -->
    <v-card rounded="0" class="soft-bloom-callout pa-8 pa-md-14 position-relative overflow-hidden mb-16 mb-md-24" elevation="8" border="t b" color="#17111b">
      <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <div class="callout-bloom-halo" aria-hidden="true"></div>

      <v-row align="center" justify="space-between" class="position-relative z-1">
        <v-col cols="12" lg="8">
          <v-chip size="small" variant="tonal" color="primary" class="font-mono text-caption font-weight-bold text-uppercase tracking-widest mb-4" prepend-icon="mdi-view-dashboard-outline">
            {{ $t('Home.Landing.Studio.Badge') }}
          </v-chip>

          <h2 class="text-h3 font-display font-weight-black text-white mb-4 tracking-tight">
            {{ $t('Home.Landing.Studio.Title') }}
          </h2>

          <p class="text-body-1 font-body text-grey-lighten-2 mb-6" style="max-width: 680px; line-height: 1.7;">
            {{ $t('Home.Landing.Studio.Subtitle') }}
          </p>

          <!-- Value Chips for Creators using v-chip -->
          <div class="d-flex flex-wrap align-center ga-3 ga-sm-4">
            <v-chip variant="outlined" color="cyan" class="font-mono text-caption" prepend-icon="mdi-chart-areaspline">
              {{ $t('Home.Landing.Studio.Feature1') }}
            </v-chip>
            <v-chip variant="outlined" color="error" class="font-mono text-caption" prepend-icon="mdi-file-document-edit-outline">
              {{ $t('Home.Landing.Studio.Feature2') }}
            </v-chip>
            <v-chip variant="outlined" color="success" class="font-mono text-caption" prepend-icon="mdi-lightning-bolt">
              {{ $t('Home.Landing.Studio.Feature3') }}
            </v-chip>
          </div>
        </v-col>

        <v-col cols="12" lg="4" class="text-lg-right mt-8 mt-lg-0 d-flex flex-column flex-sm-row flex-lg-column align-lg-end ga-3 justify-lg-center">
          <v-btn
            size="x-large"
            color="primary"
            rounded="pill"
            class="font-mono font-weight-bold text-capitalize px-8 py-4"
            elevation="4"
            @click="handleUploadClick"
          >
            <v-icon size="20" class="mr-2">mdi-view-dashboard</v-icon>
            {{ $t('Home.Landing.Studio.Button') }}
          </v-btn>
          <v-btn
            size="large"
            variant="outlined"
            rounded="pill"
            class="font-mono font-weight-bold text-capitalize px-6 py-3"
            @click="handleSoundkitsClick"
          >
            <v-icon size="18" color="primary" class="mr-2">mdi-waveform</v-icon>
            {{ $t('Home.Landing.SoundkitsCallout.Button') }}
          </v-btn>
        </v-col>
      </v-row>
      </v-container>
    </v-card>
    <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <!-- ============================================================== -->
      <!-- 6. CHAPTER I: "ZİRVEDEKİLER" (MOST STREAMED)                   -->
      <!-- ============================================================== -->
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
        :loading="GetMostStreamedTracks === null"
        playlist-icon="mdi-chart-line-variant"
        :playlist-title="$t('players.MostStreamed')"
        :playlist-subtitle="$t('players.Alltimes')"
        v-bind="$attrs"
      />
    </v-container>

    <!-- ============================================================== -->
    <!-- 6. CHAPTER II: "CANLI RADAR" (LIVE BROADCAST TERMINAL - 24H)   -->
    <!-- ============================================================== -->
    <v-card
      rounded="0"
      class="live-radar-stage pa-8 pa-md-14 position-relative overflow-hidden mb-12 mb-md-16"
      elevation="8"
      border="t b"
      color="#0e0a13"
    >
      <div class="radar-ambient-glow" aria-hidden="true"></div>
      <div class="radar-ambient-sweep" aria-hidden="true"></div>

      <v-container class="py-4 py-sm-6 px-3 px-sm-6 position-relative z-1" style="max-width: 1480px;">
        <!-- Terminal Header Section -->
        <div class="d-flex flex-column flex-lg-row align-start align-lg-center justify-space-between mb-8 pb-6 border-b border-opacity-25">
          <!-- Left: Title, Tag & Narrative -->
          <div class="mb-4 mb-lg-0">
            <div class="d-flex align-center flex-wrap ga-3 mb-3">
              <span class="font-mono text-caption text-primary font-weight-bold tracking-widest text-uppercase">
                {{ $t('Home.Landing.Recent.LiveRadarIndexTag') }}
              </span>
              <v-chip
                size="small"
                variant="tonal"
                color="primary"
                class="font-mono font-weight-bold text-uppercase"
              >
                <span class="pulse-beacon mr-2" aria-hidden="true"></span>
                {{ $t('Home.Landing.Recent.LiveRadarBadge') }}
              </v-chip>
            </div>

            <h2 class="text-h3 font-display font-weight-black text-white mb-2 tracking-tight">
              {{ $t('Home.Landing.Recent.LiveRadarTitle') }}
            </h2>

            <p class="text-body-1 font-body text-grey-lighten-2 mb-0" style="max-width: 680px; line-height: 1.6;">
              {{ $t('Home.Landing.Recent.LiveRadarSubtitle') }}
            </p>
          </div>

          <!-- Right: Telemetry Chips -->
          <div class="d-flex align-center flex-wrap ga-2 ga-sm-3">
            <v-chip
              variant="outlined"
              color="primary"
              class="font-mono text-caption"
              prepend-icon="mdi-broadcast"
            >
              {{ $t('Home.Landing.Recent.SignalUptime') }}
            </v-chip>
            <v-chip
              variant="outlined"
              color="success"
              class="font-mono text-caption"
              prepend-icon="mdi-waveform"
            >
              {{ recentTracksCountText }}
            </v-chip>
            <v-chip
              variant="outlined"
              color="warning"
              class="font-mono text-caption d-none d-sm-inline-flex"
              prepend-icon="mdi-shield-check-outline"
            >
              {{ $t('Home.Landing.ProducerCareer.AudioQuality') }}
            </v-chip>
          </div>
        </div>

        <!-- Live Track Stream -->
        <Playlist
          :tracks="filteredRecentTracks"
          :loading="GetRecentTracks === null"
          icon="mdi-radar"
          icon-color="#FF5252"
          hide-header
          v-bind="$attrs"
        />
      </v-container>
    </v-card>

    <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <!-- ============================================================== -->
      <!-- 7. CHAPTER III: "TOPLULUK FAVORİLERİ" (MOST LIKED) — Inverted   -->
      <!-- ============================================================== -->
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
        :loading="GetMostLikedTracks === null"
        playlist-icon="mdi-fire"
        :playlist-title="$t('players.MostLiked')"
        :playlist-subtitle="$t('players.Alltimes')"
        v-bind="$attrs"
      />
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import SpotlightBadge from '@/components/Audio/SpotlightBadge.vue'
import SpotlightCountdown from '@/components/Audio/SpotlightCountdown.vue'
import WaveField from '@/components/WaveField.vue'
import GlitchTitle from '@/components/GlitchTitle.vue'
import MarqueeStrip from '@/components/MarqueeStrip.vue'
import LaserDivider from '@/components/LaserDivider.vue'
import EditorialShowcase from '@/components/EditorialShowcase.vue'
import Playlist from '@/components/Playlist.vue'
import { formatCompactNumber } from '@/utils/format'

const router = useRouter()
const app = useAppStore()
const auth = useAuthStore()
const { t } = useI18n()

const {
  GET_RECENT_TRACKS: GetRecentTracks,
  GET_MOST_LIKED_TRACKS: GetMostLikedTracks,
  GET_MOST_STREAMED_TRACKS: GetMostStreamedTracks,
  GET_STATS: GetPlatformStats
} = storeToRefs(app)


const producerMetricsCount = computed(() => {
  const count = GetPlatformStats.value?.producersCount ?? 0
  return formatCompactNumber(count)
})

const trackMetricsCount = computed(() => {
  const count = GetPlatformStats.value?.tracksCount ?? 0
  return formatCompactNumber(count)
})

const marqueeItems = computed(() => [
  { text: t('Home.Landing.Marquee.Item1'), primary: true },
  { text: t('Home.Landing.Marquee.Item2'), primary: false },
  { text: t('Home.Landing.Marquee.Item3'), primary: true },
  { text: t('Home.Landing.Marquee.Item4'), primary: false },
  { text: t('Home.Landing.Marquee.Item5'), primary: true },
  { text: t('Home.Landing.Marquee.Item6'), primary: false }
])

const genreItems = [
  {
    name: 'Trap',
    color: '#D500F9',
    icon: 'mdi-fire',
    spec: '135-165 BPM',
    sound: '808s & Heavy Beats'
  },
  {
    name: 'Lo-Fi',
    color: '#FF9100',
    icon: 'mdi-coffee',
    spec: '70-90 BPM',
    sound: 'Chill & Vintage Soul'
  },
  {
    name: 'Synthwave',
    color: '#FF1744',
    icon: 'mdi-cassette',
    spec: '105-130 BPM',
    sound: '80s Retro Neon Synth'
  },
  {
    name: 'Hip-Hop',
    color: '#FFD600',
    icon: 'mdi-microphone-variant',
    spec: '85-105 BPM',
    sound: 'Boom Bap & Drill Flow'
  },
  {
    name: 'Electronic',
    color: '#00E676',
    icon: 'mdi-flash',
    spec: '124-132 BPM',
    sound: 'Club Pulse & Bassline'
  },
  {
    name: 'Cyberpunk',
    color: '#00E5FF',
    icon: 'mdi-laser-pointer',
    spec: '100-140 BPM',
    sound: 'Dark Industrial Groove'
  },
  {
    name: 'Ambient',
    color: '#7C4DFF',
    icon: 'mdi-weather-night',
    spec: '60-80 BPM',
    sound: 'Space Textures & Drone'
  }
]

const vibes = genreItems.map(g => g.name)
const studioWaveformBars = [
  35, 45, 60, 80, 50, 40, 70, 95, 85, 60, 45, 30, 55, 75, 90, 100, 80, 65, 40, 50,
  70, 85, 60, 45, 65, 85, 95, 70, 50, 40, 60, 80, 90, 75, 55, 40, 50, 70, 85, 65,
  45, 35
]
const searchQuery = ref('')

function matchesFilter(track) {
  if (!track) return false
  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    const inName = track.name?.toLowerCase().includes(q)
    const inUser = track.user?.name?.toLowerCase().includes(q)
    const inGenre = track.genres?.some(g => typeof g === 'string' && g.toLowerCase().includes(q))
    const inMood = track.moods?.some(m => typeof m === 'string' && m.toLowerCase().includes(q))
    const inTag = track.tags?.some(t => typeof t === 'string' && t.toLowerCase().includes(q))
    const inKey = track.key?.toLowerCase().includes(q)
    const inBpm = String(track.bpm || '').includes(q)
    return inName || inUser || inGenre || inMood || inTag || inKey || inBpm
  }
  return true
}

const filteredRecentTracks = computed(() => {
  if (!GetRecentTracks.value) return null
  return GetRecentTracks.value.filter(matchesFilter)
})

const recentTracksCountText = computed(() => {
  const count = filteredRecentTracks.value?.length ?? 0
  return t('Home.Landing.Recent.LiveCount', { count })
})

const filteredMostLikedTracks = computed(() => {
  if (!GetMostLikedTracks.value) return null
  return GetMostLikedTracks.value.filter(matchesFilter)
})

const filteredMostStreamedTracks = computed(() => {
  if (!GetMostStreamedTracks.value) return null
  return GetMostStreamedTracks.value.filter(matchesFilter)
})

// Candidate pool gathered from available loaded tracks
const candidatePool = computed(() => {
  const map = new Map()

  const addTracks = (list) => {
    if (!Array.isArray(list)) return
    for (const track of list) {
      if (!track) continue
      const id = String(track._id || track.id || '')
      if (!id) continue
      if (!map.has(id)) {
        // Eligibility check: must have cover art and playable audio
        const hasArt = !!track.art
        const hasAudio = !!(track.url || track.taggedAudioUrl || track.untaggedAudioUrl)
        if (hasArt && hasAudio) {
          map.set(id, track)
        }
      }
    }
  }

  addTracks(GetMostStreamedTracks.value)
  addTracks(GetMostLikedTracks.value)
  addTracks(GetRecentTracks.value)

  const tracks = Array.from(map.values())
  if (!tracks.length) return []

  // Rank candidate tracks by quality / engagement score
  return tracks.sort((a, b) => {
    const scoreA = (a.likes || 0) * 3 + (a.views || 0) + (a.bpm && a.key ? 10 : 0) + (a.genres?.length ? 5 : 0)
    const scoreB = (b.likes || 0) * 3 + (b.views || 0) + (b.bpm && b.key ? 10 : 0) + (b.genres?.length ? 5 : 0)
    return scoreB - scoreA
  })
})

// Track of the Day: Deterministic daily rotation from the elite candidates pool
const featuredTrack = computed(() => {
  const pool = candidatePool.value
  if (!pool.length) {
    return GetMostStreamedTracks.value?.[0] || GetMostLikedTracks.value?.[0] || GetRecentTracks.value?.[0] || null
  }

  const now = new Date()
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24))

  // Rotate deterministically among top 10 candidates
  const topCandidates = pool.slice(0, 10)
  const index = dayOfYear % topCandidates.length
  return topCandidates[index]
})

function handleVibeClick(vibe) {
  router.push({ name: 'Explore', query: { genre: vibe } }).catch(() => {})
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function handleHeroSearch() {
  const q = searchQuery.value?.trim()
  router.push({ name: 'Search', query: q ? { q } : {} }).catch(() => {})
}

function handleUploadClick() {
  if (auth.authenticated) {
    router.push({ name: 'Dashboard' }).catch(() => {})
  } else {
    app.setLoginOverlay(true)
  }
}

function handleSoundkitsClick() {
  if (auth.authenticated) {
    router.push({ name: 'Soundkits' }).catch(() => {})
  } else {
    app.setLoginOverlay(true)
  }
}

onMounted(() => {
  app.FETCH_STATS()
  app.RECENT_TRACKS()
  app.MOST_LIKED()
  app.MOST_STREAMED()
})
</script>

<style scoped lang="scss">
/* Typography */
.font-display {
  font-family: 'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.font-body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
}

.font-mono {
  font-family: 'Space Grotesk', monospace, sans-serif !important;
}

.landing-page {
  min-height: 100vh;
  position: relative;
  background-color: #0c0b10;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Ambient dynamic background lighting */
.landing-ambient-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

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

.z-1 {
  z-index: 1;
}

/* Hero Stage */
.landing-hero {
  background: linear-gradient(180deg, rgba(24, 18, 24, 0.9) 0%, rgba(14, 12, 18, 0.96) 75%, rgba(12, 11, 16, 0.5) 100%);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  min-height: 460px;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.68;
  pointer-events: none;
}

.hero-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 75% 35%, rgba(211, 47, 47, 0.18) 0%, transparent 65%),
              linear-gradient(180deg, transparent 40%, rgba(12, 11, 16, 0.95) 100%);
  pointer-events: none;
}

.pulse-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff5252;
  box-shadow: 0 0 10px #ff5252;
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

.hero-headline {
  font-size: clamp(2.4rem, 4.2vw, 4.4rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.025em !important;
  line-height: 1.12 !important;
  text-shadow: 0 0 35px rgba(255, 82, 82, 0.25);
}

.hero-narrative {
  font-size: 1.05rem !important;
  line-height: 1.72 !important;
  color: rgba(255, 255, 255, 0.82) !important;
  letter-spacing: 0.01em;
}

/* Spotlight Glow */
.spotlight-ambient-glow {
  position: absolute;
  inset: -16px;
  background: radial-gradient(circle, rgba(255, 82, 82, 0.3) 0%, transparent 70%);
  filter: blur(24px);
  border-radius: 28px;
  pointer-events: none;
}


/* Producer Career Section */
.producer-career-section {
  .producer-ambient-glow {
    position: absolute;
    top: 15%;
    left: 10%;
    width: 65%;
    height: 60%;
    background: radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, rgba(255, 82, 82, 0.08) 50%, transparent 75%);
    filter: blur(100px);
    pointer-events: none;
  }
}

.producer-studio-card {
  border-top: 2.5px solid rgba(255, 82, 82, 0.7) !important;
  backdrop-filter: blur(28px);

  .studio-card-glow {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(255, 82, 82, 0.22) 0%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }
}

.studio-audio-strip {
  height: 44px;
  width: 100%;

  .sound-wave-bar {
    flex: 1 1 0;
    max-width: 8px;
    min-width: 3px;
    border-radius: 4px;
    background: linear-gradient(180deg, #ff5252 0%, rgba(255, 82, 82, 0.2) 100%);
    transform-origin: bottom;
    animation: studio-sound-bounce 1.5s ease-in-out infinite alternate;
  }
}

@keyframes studio-sound-bounce {
  0% {
    transform: scaleY(0.25);
    opacity: 0.6;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.studio-live-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00E676;
  box-shadow: 0 0 8px #00E676;
  animation: beacon-pulse 2s infinite ease-in-out;
}

/* Soft Bloom Callout Banner */
.soft-bloom-callout {
  border-color: rgba(255, 82, 82, 0.3) !important;
  backdrop-filter: blur(28px);

  .callout-bloom-halo {
    position: absolute;
    top: -80px;
    right: 15%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255, 82, 82, 0.28) 0%, transparent 70%);
    filter: blur(100px);
    pointer-events: none;
  }
}

/* Popular Genres Cyber Cards */
.genre-cyber-card {
  min-height: 155px;
  background-color: #131018 !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  border-top: 2.5px solid var(--genre-color) !important;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.28s ease,
              box-shadow 0.28s ease;

  .genre-card-bloom {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 140px;
    height: 140px;
    filter: blur(28px);
    opacity: 0.35;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .genre-arrow {
    transition: transform 0.25s ease, color 0.25s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: var(--genre-color) !important;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(var(--v-theme-primary), 0.15) !important;

    .genre-card-bloom {
      opacity: 0.9;
      transform: scale(1.25);
    }

    .genre-arrow {
      transform: translate(2px, -2px);
      color: var(--genre-color) !important;
    }
  }
}

/* Live Radar Stage (Full Width) */
.live-radar-stage {
  border-color: rgba(255, 82, 82, 0.25) !important;
  backdrop-filter: blur(28px);

  .radar-ambient-glow {
    position: absolute;
    top: -120px;
    left: 15%;
    width: 650px;
    height: 450px;
    background: radial-gradient(circle, rgba(255, 82, 82, 0.22) 0%, transparent 70%);
    filter: blur(100px);
    pointer-events: none;
  }

  .radar-ambient-sweep {
    position: absolute;
    bottom: -100px;
    right: 15%;
    width: 550px;
    height: 400px;
    background: radial-gradient(circle, rgba(213, 0, 249, 0.12) 0%, transparent 70%);
    filter: blur(90px);
    pointer-events: none;
  }
}


/* Playlist Title & Badge */
.playlist-section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.25;

  @media (min-width: 600px) {
    font-size: 1.5rem;
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
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #ff5252;
    box-shadow: 0 0 8px #ff5252;
    animation: beacon-pulse 2s infinite ease-in-out;
  }
}
</style>