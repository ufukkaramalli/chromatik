<template>
  <v-row class="mb-10">
    <!-- Total Tracks -->
    <v-col cols="12" sm="6" md="3">
      <v-card class="glass-card rounded-xl pa-5 elevation-12">
        <div class="d-flex align-start justify-space-between">
          <div>
            <div class="text-overline text-medium-emphasis mb-1 font-weight-bold">{{ $t('Dashboard.TotalTracks') }}</div>
            <div class="text-h3 font-weight-black text-high-emphasis">{{ tracksCount }}</div>
          </div>
          <div class="stat-icon-wrapper bg-primary-subtle">
            <v-icon color="primary" size="32">mdi-music</v-icon>
          </div>
        </div>
        <div class="text-caption text-success mt-4 d-flex align-center font-weight-medium">
          <v-icon size="small" class="mr-1">mdi-trending-up</v-icon> {{ $t('Dashboard.Active') }}
        </div>
      </v-card>
    </v-col>

    <!-- Total Soundkits -->
    <v-col cols="12" sm="6" md="3">
      <v-card class="glass-card rounded-xl pa-5 elevation-12">
        <div class="d-flex align-start justify-space-between">
          <div>
            <div class="text-overline text-medium-emphasis mb-1 font-weight-bold">{{ $t('Dashboard.TotalSoundkits') }}</div>
            <div class="text-h3 font-weight-black text-high-emphasis">{{ soundkitsCount }}</div>
          </div>
          <div class="stat-icon-wrapper bg-info-subtle">
            <v-icon color="info" size="32">mdi-drum</v-icon>
          </div>
        </div>
        <div class="text-caption text-info mt-4 d-flex align-center font-weight-medium">
          <v-icon size="small" class="mr-1">mdi-package-variant</v-icon> {{ $t('Dashboard.Ready') }}
        </div>
      </v-card>
    </v-col>

    <!-- Total Plays -->
    <v-col cols="12" sm="6" md="3">
      <v-card class="glass-card rounded-xl pa-5 elevation-12">
        <div class="d-flex align-start justify-space-between">
          <div>
            <div class="text-overline text-medium-emphasis mb-1 font-weight-bold">{{ $t('Dashboard.TotalPlays') }}</div>
            <div class="text-h3 font-weight-black text-high-emphasis">{{ totalViews }}</div>
          </div>
          <div class="stat-icon-wrapper bg-warning-subtle">
            <v-icon color="warning" size="32">mdi-play-circle</v-icon>
          </div>
        </div>
        <div class="text-caption text-warning mt-4 d-flex align-center font-weight-medium">
          <v-icon size="small" class="mr-1">mdi-chart-line</v-icon> {{ $t('Dashboard.AllTime') }}
        </div>
      </v-card>
    </v-col>

    <!-- Total Revenue -->
    <v-col cols="12" sm="6" md="3">
      <v-card class="glass-card rounded-xl pa-5 elevation-12">
        <div class="d-flex align-start justify-space-between">
          <div>
            <div class="text-overline text-medium-emphasis mb-1 font-weight-bold">{{ $t('Dashboard.TotalRevenue') }}</div>
            <div class="text-h3 font-weight-black text-high-emphasis">{{ formattedRevenue }}</div>
          </div>
          <div class="stat-icon-wrapper bg-success-subtle">
            <v-icon color="success" size="32">mdi-currency-usd</v-icon>
          </div>
        </div>
        <div class="text-caption text-grey mt-4 d-flex align-center font-weight-medium">
          {{ $t('Dashboard.AwaitingSale') }}
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
defineProps<{
  tracksCount: number
  soundkitsCount: number
  totalViews: number
  formattedRevenue: string
}>()
</script>

<style scoped lang="scss">
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

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-primary-subtle { background: rgba(211, 47, 47, 0.15); }
.bg-info-subtle { background: rgba(33, 150, 243, 0.15); }
.bg-warning-subtle { background: rgba(255, 152, 0, 0.15); }
.bg-success-subtle { background: rgba(76, 175, 80, 0.15); }
</style>
