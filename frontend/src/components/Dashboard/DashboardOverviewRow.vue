<template>
  <div class="dashboard-overview-section">
    <!-- High Contrast Overview Row -->
    <v-row class="mb-10">
      <v-col cols="12" lg="8">
        <v-card class="gradient-card rounded-xl elevation-12 overflow-hidden h-100 border-white-10">
          <div class="gradient-overlay pa-6 pa-md-8 d-flex flex-column justify-space-between h-100">
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="text-overline font-weight-bold text-medium-emphasis mb-1 letter-spacing-1">{{ $t('Dashboard.Overview') }}</div>
                <div class="text-h2 font-weight-black text-high-emphasis tracking-tight mb-1">{{ formattedRevenue }}</div>
                <div class="text-subtitle-1 font-weight-regular text-medium-emphasis">{{ $t('Dashboard.RevenueThisMonth') }}</div>
              </div>
              <v-btn icon="mdi-arrow-top-right" variant="tonal" size="large" class="glass-btn"></v-btn>
            </div>
            
            <v-divider class="my-6 ck-border-subtle"></v-divider>

            <div class="d-flex align-center">
              <v-avatar color="primary" variant="flat" rounded="lg" size="48" class="elevation-6 mr-4">
                <v-icon size="28" color="white">mdi-trending-up</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold text-high-emphasis mb-1">{{ $t('Dashboard.TipsTitle') }}</div>
                <div class="text-body-2 text-medium-emphasis" style="max-width: 600px; line-height: 1.5;">
                  {{ $t('Dashboard.TipsDesc') }}
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card class="glass-card rounded-xl elevation-12 h-100 pa-6 d-flex flex-column">
          <div class="text-overline font-weight-bold text-primary mb-4 d-flex align-center">
            <v-icon start size="18">mdi-crown</v-icon> {{ $t('Dashboard.TopTrack') }}
          </div>
          
          <template v-if="tracks.length > 0">
            <div class="text-center mb-4 mt-2">
              <v-avatar rounded="lg" size="110" class="elevation-12 border-white-10 top-track-art ck-art-backing">
                <v-img :src="getApiUrl(tracks[0].art)" cover></v-img>
                <div class="top-track-overlay d-flex align-center justify-center">
                  <v-icon color="white" size="40">mdi-play-circle</v-icon>
                </div>
              </v-avatar>
            </div>
            <div class="text-center mt-auto">
              <div class="text-h5 font-weight-black text-high-emphasis text-truncate">{{ tracks[0].name }}</div>
              <div class="d-flex align-center justify-center mt-2 gap-3">
                <div class="stat-pill bg-white-5">
                  <v-icon size="16" class="text-info mr-1">mdi-play</v-icon>
                  <span class="font-weight-bold text-high-emphasis">{{ tracks[0].views || 0 }}</span>
                </div>
                <div class="stat-pill bg-white-5">
                  <v-icon size="16" class="text-error mr-1">mdi-heart</v-icon>
                  <span class="font-weight-bold text-high-emphasis">{{ tracks[0].likes || 0 }}</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex flex-column align-center justify-center h-100 text-center opacity-50 py-8">
              <v-icon size="64" color="grey" class="mb-3">mdi-music-off</v-icon>
              <div class="text-subtitle-1 text-grey font-weight-medium">{{ $t('Dashboard.NoTracksUploaded') }}</div>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Row (Asymmetrical) -->
    <v-row class="mb-10">
      <!-- Col 4 (Left Side) - Audience / Stats -->
      <v-col cols="12" lg="4">
        <v-card class="glass-card rounded-xl elevation-12 h-100 pa-6 pa-md-8 d-flex flex-column justify-center border-white-10">
          <div class="text-overline font-weight-bold text-info mb-4 d-flex align-center">
            <v-icon start size="18">mdi-account-group</v-icon> {{ $t('Dashboard.Audience') }}
          </div>
          
          <div class="d-flex flex-column gap-4">
            <div v-for="stat in audienceData" :key="stat.label">
              <div class="d-flex justify-space-between align-end mb-2">
                <span class="text-subtitle-2 text-medium-emphasis">{{ $t(stat.label) }}</span>
                <span class="font-weight-black text-high-emphasis">{{ stat.percentage }}%</span>
              </div>
              <v-progress-linear :model-value="stat.percentage" color="info" height="6" rounded></v-progress-linear>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Col 8 (Right Side) - The Chart -->
      <v-col cols="12" lg="8">
        <v-card class="glass-card rounded-xl elevation-12 overflow-hidden h-100 border-white-10 pa-6 pa-md-8 d-flex flex-column">
          <div class="d-flex justify-space-between align-start mb-2">
            <div>
              <div class="text-overline font-weight-bold text-medium-emphasis mb-1 letter-spacing-1">{{ $t('Dashboard.PlaysOverview') }}</div>
              <div class="text-h5 font-weight-black text-high-emphasis tracking-tight">{{ $t('Dashboard.Last7Days') }}</div>
            </div>
            <v-chip color="success" variant="flat" size="small" class="font-weight-bold"><v-icon start size="14">mdi-arrow-up-bold</v-icon> 24%</v-chip>
          </div>
          
          <!-- Pure CSS Bar Chart -->
          <div class="chart-container mt-auto d-flex align-end justify-space-between pt-4">
            <div class="chart-bar-wrapper" v-for="(day, i) in chartData" :key="i">
              <div class="chart-bar rounded-t-lg" :style="{ height: day.height + '%' }">
                <div class="chart-tooltip">{{ day.plays }} {{ $t('Dashboard.Plays') }}</div>
              </div>
              <div class="text-caption text-grey-lighten-1 mt-2 font-weight-medium">{{ $t(day.label) }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { ChartDay, AudienceCountry } from '@/composables/dashboard/useDashboard'

defineProps<{
  tracks: any[]
  formattedRevenue: string
  audienceData: AudienceCountry[]
  chartData: ChartDay[]
  getApiUrl: (path: string) => string
}>()
</script>

<style scoped lang="scss">
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.border-white-10 {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.letter-spacing-1 { letter-spacing: 1px; }

.tracking-tight {
  letter-spacing: -0.5px;
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.75) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(var(--v-theme-primary), 0.35) !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 0 20px rgba(211, 47, 47, 0.1) !important;
  }
}

.gradient-card {
  background: linear-gradient(135deg, rgba(211,47,47,0.3) 0%, rgba(var(--v-theme-surface), 1) 100%) !important;
  position: relative;
}

.gradient-overlay {
  background: radial-gradient(circle at top right, rgba(211,47,47,0.12) 0%, transparent 60%);
  position: relative;
  z-index: 1;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
  }
}

.top-track-art {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
    .top-track-overlay { opacity: 1; }
  }
}

.top-track-overlay {
  position: absolute;
  inset: 0;
  background: rgba(211,47,47,0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-pill {
  background: rgba(var(--v-theme-on-surface), 0.05);
  padding: 4px 12px;
  border-radius: 20px;
}

.chart-container {
  height: 140px;
  width: 100%;
}

.chart-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 12%;
  position: relative;
}

.chart-bar {
  width: 100%;
  min-width: 24px;
  max-width: 48px;
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.2) 100%);
  opacity: 0.6;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  cursor: pointer;

  &:hover {
    background: linear-gradient(180deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
    opacity: 1;
    box-shadow: 0 0 25px rgba(var(--v-theme-primary), 0.5);
    transform: scaleY(1.02);
    transform-origin: bottom;

    .chart-tooltip {
      opacity: 1;
      top: -45px;
    }
  }
}

.chart-tooltip {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}
</style>
