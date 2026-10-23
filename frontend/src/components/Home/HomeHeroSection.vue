<template>
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
            <span class="text-medium-emphasis">{{ $t('Home.Landing.Hero.LiveEngine') }}</span>
          </v-chip>

          <!-- Monumental Headline with Outfit & Glitch -->
          <div class="mb-4">
            <GlitchTitle
              :text="$t('Home.Landing.Hero.Title')"
              tag="h1"
              className="hero-headline text-high-emphasis font-display mb-0"
            />
          </div>

          <!-- Subtitle with Plus Jakarta Sans -->
          <p class="text-body-1 text-medium-emphasis hero-narrative font-body mb-6" style="max-width: 640px;">
            {{ $t('Home.Landing.Hero.Subtitle') }}
          </p>

          <!-- Interactive Hero Search Bar (Vuetify v-text-field) -->
          <v-text-field
            :model-value="searchQuery"
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
            @update:model-value="$emit('update:searchQuery', $event || '')"
            @keyup.enter="$emit('search')"
          >
            <template #append-inner>
              <v-btn
                color="primary"
                size="small"
                rounded="pill"
                class="font-mono font-weight-bold px-4"
                elevation="0"
                @click="$emit('search')"
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
              @click="$emit('explore')"
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
              @click="$emit('upload')"
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
            <v-card class="rounded-2xl pa-4 position-relative z-1" elevation="8" border color="surface">
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
                    <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1" style="font-size: 0.68rem !important;">
                      {{ $t('Home.Landing.Hero.Tempo') }}
                    </div>
                    <div class="text-caption font-weight-bold text-high-emphasis text-truncate">
                      {{ featuredTrack?.bpm ? `${featuredTrack.bpm} BPM` : $t('Home.Landing.Hero.DefaultBpm') }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="4">
                  <v-sheet rounded="lg" border class="pa-2 bg-surface-light border-opacity-25">
                    <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1" style="font-size: 0.68rem !important;">
                      {{ $t('Home.Landing.Hero.Key') }}
                    </div>
                    <div class="text-caption font-weight-bold text-primary text-truncate">
                      {{ featuredTrack?.key || $t('Home.Landing.Hero.DefaultKey') }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="4">
                  <v-sheet rounded="lg" border class="pa-2 bg-surface-light border-opacity-25">
                    <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1" style="font-size: 0.68rem !important;">
                      {{ $t('Home.Landing.Hero.Style') }}
                    </div>
                    <div class="text-caption font-weight-bold text-high-emphasis text-truncate">
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
</template>

<script setup lang="ts">
import WaveField from '@/components/Visualizers/WaveField.vue'
import GlitchTitle from '@/components/GlitchTitle.vue'
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import SpotlightBadge from '@/components/Audio/SpotlightBadge.vue'
import SpotlightCountdown from '@/components/Audio/SpotlightCountdown.vue'
import type { TrackLike } from '@/types/audio'

defineProps<{
  searchQuery: string
  featuredTrack: TrackLike | null
}>()

defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'search'): void
  (e: 'explore'): void
  (e: 'upload'): void
}>()
</script>

<style scoped lang="scss">
.font-display {
  font-family: 'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.font-body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
}

.font-mono {
  font-family: 'Space Grotesk', monospace, sans-serif !important;
}

.z-1 {
  z-index: 1;
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

.landing-hero {
  background: linear-gradient(180deg, rgba(24, 18, 24, 0.9) 0%, rgba(14, 12, 18, 0.96) 75%, rgba(12, 11, 16, 0.5) 100%);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  min-height: 460px;

  .v-theme--light & {
    background: #f8fafc !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }
}

.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.68;
  pointer-events: none;

  .v-theme--light & {
    opacity: 0.92;
  }
}

.hero-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 75% 35%, rgba(211, 47, 47, 0.18) 0%, transparent 65%),
              linear-gradient(180deg, transparent 40%, rgba(12, 11, 16, 0.95) 100%);
  pointer-events: none;

  .v-theme--light & {
    background: linear-gradient(180deg, transparent 80%, rgba(248, 250, 252, 0.9) 100%);
  }
}

.hero-headline {
  font-size: clamp(2.4rem, 4.2vw, 4.4rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.025em !important;
  line-height: 1.12 !important;
  text-shadow: 0 0 35px rgba(255, 82, 82, 0.25);

  .v-theme--light & {
    text-shadow: none;
    color: #0f172a !important;
  }
}

.hero-narrative {
  font-size: 1.05rem !important;
  line-height: 1.72 !important;
  color: rgba(255, 255, 255, 0.82) !important;
  letter-spacing: 0.01em;

  .v-theme--light & {
    color: #475569 !important;
  }
}

.spotlight-ambient-glow {
  position: absolute;
  inset: -16px;
  background: radial-gradient(circle, rgba(255, 82, 82, 0.3) 0%, transparent 70%);
  filter: blur(24px);
  border-radius: 28px;
  pointer-events: none;

  .v-theme--light & {
    display: none !important;
  }
}
</style>
