<template>
  <section class="producer-career-section mb-16 mb-md-24 position-relative">
    <div class="producer-ambient-glow" aria-hidden="true"></div>

    <v-row class="position-relative z-1" align="center">
      <!-- Left Column: Creator Value Pitch & 4 Key Guarantees -->
      <v-col cols="12" lg="7" class="mb-8 mb-lg-0 pr-lg-10">
        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          class="font-mono text-caption font-weight-bold text-uppercase tracking-widest mb-4"
          prepend-icon="mdi-account-music-outline"
        >
          {{ $t('Home.Landing.ProducerCareer.Badge') }}
        </v-chip>

        <h2 class="text-h3 font-display font-weight-black text-high-emphasis mb-4 tracking-tight">
          {{ $t('Home.Landing.ProducerCareer.Title') }}
        </h2>

        <p class="text-body-1 font-body text-medium-emphasis mb-8 line-height-relaxed" style="max-width: 640px;">
          {{ $t('Home.Landing.ProducerCareer.Subtitle') }}
        </p>

        <div class="d-flex flex-column ga-4 mb-0">
          <div class="d-flex align-start" v-for="n in 4" :key="n">
            <v-avatar size="28" color="success" variant="tonal" class="mr-3 mt-1 flex-shrink-0">
              <v-icon size="16">mdi-check-bold</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-body-1 font-display font-weight-bold text-high-emphasis mb-1">
                {{ $t(`Home.Landing.ProducerCareer.Point${n}Title`) }}
              </h3>
              <p class="text-body-2 font-body text-medium-emphasis mb-0">
                {{ $t(`Home.Landing.ProducerCareer.Point${n}Desc`) }}
              </p>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Right Column: Studio Showcase Card (v-card) -->
      <v-col cols="12" lg="5">
        <v-card class="producer-studio-card rounded-3xl pa-7 pa-md-8 position-relative overflow-hidden" elevation="8" border color="surface">
          <div class="studio-card-glow" aria-hidden="true"></div>

          <div class="position-relative z-1">
            <div class="d-flex align-center justify-space-between pb-4 mb-6 border-b">
              <div class="d-flex align-center ga-3">
                <span class="studio-live-beacon flex-shrink-0"></span>
                <span class="font-mono text-caption font-weight-bold text-high-emphasis tracking-widest text-uppercase">
                  {{ $t('Home.Landing.ProducerCareer.StudioCardTitle') }}
                </span>
              </div>
              <v-icon size="20" color="primary">mdi-shield-check</v-icon>
            </div>

            <div class="mb-6">
              <p class="text-body-2 font-body text-medium-emphasis mb-6 line-height-relaxed">
                {{ $t('Home.Landing.ProducerCareer.StudioCardSubtitle') }}
              </p>

              <!-- Live Metrics Row using v-sheet -->
              <div class="d-flex flex-column flex-sm-row ga-3">
                <v-sheet rounded="xl" border class="studio-metric pa-4 flex-grow-1 bg-surface-light border-opacity-25">
                  <div class="font-mono text-caption text-medium-emphasis text-uppercase mb-1">
                    {{ $t('Home.Landing.ProducerCareer.ActiveSellers') }}
                  </div>
                  <div class="text-h5 font-display font-weight-black text-high-emphasis">
                    {{ producerMetricsCount }}
                  </div>
                </v-sheet>

                <v-sheet rounded="xl" border class="studio-metric studio-metric--accent pa-4 flex-grow-1 bg-surface-light border-opacity-25">
                  <div class="font-mono text-caption text-medium-emphasis text-uppercase mb-1">
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
                <div class="d-flex align-center font-mono text-caption text-medium-emphasis font-weight-bold" style="font-size: 0.68rem !important; letter-spacing: 0.08em;">
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
</template>

<script setup lang="ts">
defineProps<{
  producerMetricsCount: string
  trackMetricsCount: string
  studioWaveformBars: number[]
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

.line-height-relaxed {
  line-height: 1.7 !important;
}

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

    .v-theme--light & {
      background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(211, 47, 47, 0.12) 50%, transparent 75%);
      filter: blur(90px);
    }
  }
}

.studio-live-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00E676;
  box-shadow: 0 0 10px #00E676;
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

.producer-studio-card {
  border-top: 2.5px solid rgba(255, 82, 82, 0.7) !important;
  backdrop-filter: blur(28px);

  .v-theme--light & {
    background:
      linear-gradient(160deg, #FFF1F2 0%, #FFFFFF 42%, #FFFFFF 70%, #F0FDF4 100%) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid #FECDD3 !important;
    border-top: 2.5px solid #D32F2F !important;
    box-shadow:
      0 1px 3px rgba(15, 23, 42, 0.04),
      0 18px 40px -12px rgba(211, 47, 47, 0.18) !important;

    .studio-card-glow {
      background: radial-gradient(circle, rgba(244, 63, 94, 0.22) 0%, transparent 70%);
      filter: blur(36px);
    }

    .studio-metric {
      background: rgba(255, 255, 255, 0.75) !important;
      border-color: #E2E8F0 !important;
    }

    .studio-metric--accent {
      background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%) !important;
      border-color: #FECDD3 !important;
    }
  }

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

    .v-theme--light & {
      background: linear-gradient(180deg, #E11D48 0%, #F43F5E 45%, rgba(244, 63, 94, 0.18) 100%);
    }
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
</style>
