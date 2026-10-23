<template>
  <v-card
    rounded="0"
    class="live-radar-stage pa-8 pa-md-14 position-relative overflow-hidden mb-12 mb-md-16"
    elevation="8"
    border="t b"
    color="surface"
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

          <h2 class="text-h3 font-display font-weight-black text-high-emphasis mb-2 tracking-tight">
            {{ $t('Home.Landing.Recent.LiveRadarTitle') }}
          </h2>

          <p class="text-body-1 font-body text-medium-emphasis mb-0" style="max-width: 680px; line-height: 1.6;">
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
        :tracks="tracks"
        :loading="loading"
        icon="mdi-radar"
        icon-color="#FF5252"
        hide-header
        v-bind="$attrs"
      />
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import Playlist from '@/components/Audio/Playlist.vue'
import type { TrackLike } from '@/types/audio'

defineProps<{
  tracks?: TrackLike[] | null
  loading?: boolean
  recentTracksCountText: string
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

.live-radar-stage {
  border-color: rgba(255, 82, 82, 0.25) !important;
  backdrop-filter: blur(28px);

  .v-theme--light & {
    background:
      linear-gradient(rgba(211, 47, 47, 0.035) 1px, transparent 1px) 0 0 / 100% 40px,
      linear-gradient(90deg, rgba(211, 47, 47, 0.035) 1px, transparent 1px) 0 0 / 40px 100%,
      linear-gradient(120deg, #FFF1F2 0%, #FFFFFF 38%, #FFFFFF 62%, #FAF5FF 100%) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-color: #FECDD3 !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 18px 40px -16px rgba(211, 47, 47, 0.14) !important;

    .radar-ambient-glow {
      background: radial-gradient(circle, rgba(244, 63, 94, 0.18) 0%, transparent 70%);
    }

    .radar-ambient-sweep {
      background: radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, transparent 70%);
    }
  }

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
</style>
