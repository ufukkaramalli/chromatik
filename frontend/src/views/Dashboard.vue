<template>
  <v-main class="bg-background">
    <!-- Hero Banner with Gradient -->
    <DashboardHeroBanner
      :user-name="auth.user?.name"
      @upload-beat="showUploadModal = true"
    />

    <!-- Main Container overlapping the banner -->
    <v-container fluid class="px-6 px-md-12 content-container">
      <!-- Glass Stats Row -->
      <DashboardStatsRow
        :tracks-count="tracks.length"
        :soundkits-count="soundkits.length"
        :total-views="totalViews"
        :formatted-revenue="formatCurrency(0)"
      />

      <!-- High Contrast Overview Row & CSS Chart -->
      <DashboardOverviewRow
        :tracks="tracks"
        :formatted-revenue="formatCurrency(0)"
        :audience-data="audienceData"
        :chart-data="chartData"
        :get-api-url="getApiUrl"
      />

      <!-- Tabs & Content -->
      <v-row>
        <v-col cols="12">
          <v-tabs 
            v-model="activeTab" 
            color="primary" 
            bg-color="transparent" 
            class="mb-6 font-weight-bold border-b border-white-10"
            slider-color="primary"
          >
            <v-tab value="tracks" class="text-none text-subtitle-1 px-8" rounded="0">
              <v-icon start class="mr-2">mdi-album</v-icon>
              {{ $t('Navigation.Tracks') }}
              <v-chip size="x-small" color="white" variant="outlined" class="ml-2 font-weight-black">{{ tracks.length }}</v-chip>
            </v-tab>
            <v-tab value="soundkits" class="text-none text-subtitle-1 px-8" rounded="0">
              <v-icon start class="mr-2">mdi-folder-music</v-icon>
              {{ $t('Navigation.Soundkits') }}
              <v-chip size="x-small" color="white" variant="outlined" class="ml-2 font-weight-black">{{ soundkits.length }}</v-chip>
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="bg-transparent overflow-visible">
            <!-- TRACKS TAB -->
            <v-window-item value="tracks">
              <DashboardTracksTab
                :tracks="tracks"
                :loading="loading"
                :is-deleting="isDeleting"
                :get-api-url="getApiUrl"
                @upload="showUploadModal = true"
                @delete="confirmDelete"
              />
            </v-window-item>

            <!-- SOUNDKITS TAB -->
            <v-window-item value="soundkits">
              <DashboardSoundkitsTab
                :soundkits="soundkits"
                :get-api-url="getApiUrl"
              />
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>

      <!-- Upload Modal -->
      <UploadTrackModal v-model="showUploadModal" @uploaded="fetchTracks" />

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteConfirm" max-width="400" persistent>
        <v-card class="bg-surface rounded-xl border elevation-24">
          <v-card-title class="text-h6 pt-6 px-6 font-weight-bold text-high-emphasis">
            <v-icon color="error" class="mr-2">mdi-alert</v-icon> {{ $t('Dashboard.DeleteTrack') }}
          </v-card-title>
          <v-card-text class="text-body-1 text-medium-emphasis px-6 pt-2 pb-6">
            {{ $t('Dashboard.DeleteConfirmMsg') }}
          </v-card-text>
          <v-card-actions class="pa-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey" class="font-weight-bold rounded-pill px-4" @click="showDeleteConfirm = false">{{ $t('Dashboard.Cancel') }}</v-btn>
            <v-btn variant="flat" color="error" class="px-6 rounded-pill text-none font-weight-bold" :loading="isDeleting === trackToDelete" @click="executeDelete">
              {{ $t('Dashboard.DeleteTrack') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top" :timeout="3000" class="mt-4 rounded-lg">
        <div class="d-flex align-center font-weight-bold">
          <v-icon start size="20">{{ snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
          {{ snackbar.text }}
        </div>
      </v-snackbar>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useDashboard } from '@/composables/dashboard/useDashboard'
import DashboardHeroBanner from '@/components/Dashboard/DashboardHeroBanner.vue'
import DashboardStatsRow from '@/components/Dashboard/DashboardStatsRow.vue'
import DashboardOverviewRow from '@/components/Dashboard/DashboardOverviewRow.vue'
import DashboardTracksTab from '@/components/Dashboard/DashboardTracksTab.vue'
import DashboardSoundkitsTab from '@/components/Dashboard/DashboardSoundkitsTab.vue'
import UploadTrackModal from '@/components/Forms/UploadTrackModal.vue'

const {
  auth,
  tracks,
  soundkits,
  loading,
  activeTab,
  showUploadModal,
  isDeleting,
  showDeleteConfirm,
  trackToDelete,
  snackbar,
  chartData,
  audienceData,
  totalViews,
  formatCurrency,
  fetchTracks,
  confirmDelete,
  executeDelete,
  getApiUrl
} = useDashboard()
</script>

<style scoped lang="scss">
.content-container {
  margin-top: -80px;
  position: relative;
  z-index: 2;
}

.border-white-10 {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>