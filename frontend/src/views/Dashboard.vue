<template>
  <v-main class="bg-black" v-cloak>
    
    <!-- Hero Banner with Gradient -->
    <div class="hero-banner d-flex align-center px-6 px-md-12 pt-12 pb-16">
      <div class="hero-content w-100 d-flex flex-column flex-md-row justify-space-between align-md-center">
        <div>
          <h1 class="text-h3 font-weight-black text-white mb-2 hero-title">
            {{ $t('Dashboard.Welcome', { name: auth.user?.name || 'Producer' }) }}
          </h1>
          <p class="text-grey-lighten-1 text-subtitle-1">{{ $t('Dashboard.Subtitle') }}</p>
        </div>
        <div class="d-flex gap-3 mt-6 mt-md-0">
          <v-btn 
            color="white" 
            variant="outlined" 
            prepend-icon="mdi-folder-music" 
            size="x-large" 
            class="text-none font-weight-bold rounded-lg border-white-20 glass-btn"
          >
            {{ $t('Dashboard.UploadSoundkit') }}
          </v-btn>
          <v-btn 
            color="primary" 
            prepend-icon="mdi-upload" 
            size="x-large" 
            @click="showUploadModal = true" 
            class="text-none font-weight-bold elevation-8 rounded-lg glow-primary"
          >
            {{ $t('Dashboard.UploadBeat') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Main Container overlapping the banner -->
    <v-container fluid class="px-6 px-md-12 content-container">
      
      <!-- Glass Stats Row -->
      <v-row class="mb-10">
        <v-col cols="12" sm="6" md="3">
          <v-card class="glass-card rounded-xl pa-5 elevation-12">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-overline text-grey-lighten-1 mb-1 font-weight-bold">{{ $t('Dashboard.TotalTracks') }}</div>
                <div class="text-h3 font-weight-black text-white">{{ tracks.length }}</div>
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

        <v-col cols="12" sm="6" md="3">
          <v-card class="glass-card rounded-xl pa-5 elevation-12">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-overline text-grey-lighten-1 mb-1 font-weight-bold">{{ $t('Dashboard.TotalSoundkits') }}</div>
                <div class="text-h3 font-weight-black text-white">{{ soundkits.length }}</div>
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

        <v-col cols="12" sm="6" md="3">
          <v-card class="glass-card rounded-xl pa-5 elevation-12">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-overline text-grey-lighten-1 mb-1 font-weight-bold">{{ $t('Dashboard.TotalPlays') }}</div>
                <div class="text-h3 font-weight-black text-white">{{ totalViews }}</div>
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

        <v-col cols="12" sm="6" md="3">
          <v-card class="glass-card rounded-xl pa-5 elevation-12">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="text-overline text-grey-lighten-1 mb-1 font-weight-bold">{{ $t('Dashboard.TotalRevenue') }}</div>
                <div class="text-h3 font-weight-black text-white">{{ formatCurrency(0) }}</div>
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

      <!-- High Contrast Overview Row -->
      <v-row class="mb-10">
        <v-col cols="12" lg="8">
          <v-card class="gradient-card rounded-xl elevation-12 overflow-hidden h-100 border-white-10">
            <div class="gradient-overlay pa-6 pa-md-8 d-flex flex-column justify-space-between h-100">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <div class="text-overline font-weight-bold text-white-50 mb-1 letter-spacing-1">{{ $t('Dashboard.Overview') }}</div>
                  <div class="text-h2 font-weight-black text-white tracking-tight mb-1">{{ formatCurrency(0) }}</div>
                  <div class="text-subtitle-1 font-weight-regular text-grey-lighten-1">{{ $t('Dashboard.RevenueThisMonth') }}</div>
                </div>
                <v-btn icon="mdi-arrow-top-right" variant="tonal" color="white" size="large" class="glass-btn"></v-btn>
              </div>
              
              <v-divider class="my-6 border-white-10"></v-divider>

              <div class="d-flex align-center">
                <v-avatar color="primary" variant="flat" rounded="lg" size="48" class="elevation-6 mr-4">
                  <v-icon size="28" color="white">mdi-trending-up</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text-white mb-1">{{ $t('Dashboard.TipsTitle') }}</div>
                  <div class="text-body-2 text-grey-lighten-1" style="max-width: 600px; line-height: 1.5;">
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
                <v-avatar rounded="lg" size="110" class="elevation-12 border-white-10 top-track-art">
                  <v-img :src="getApiUrl(tracks[0].art)" cover></v-img>
                  <div class="top-track-overlay d-flex align-center justify-center">
                    <v-icon color="white" size="40">mdi-play-circle</v-icon>
                  </div>
                </v-avatar>
              </div>
              <div class="text-center mt-auto">
                <div class="text-h5 font-weight-black text-white text-truncate">{{ tracks[0].name }}</div>
                <div class="d-flex align-center justify-center mt-2 gap-3">
                  <div class="stat-pill bg-white-5">
                    <v-icon size="16" class="text-info mr-1">mdi-play</v-icon>
                    <span class="font-weight-bold text-white">{{ tracks[0].views || 0 }}</span>
                  </div>
                  <div class="stat-pill bg-white-5">
                    <v-icon size="16" class="text-error mr-1">mdi-heart</v-icon>
                    <span class="font-weight-bold text-white">{{ tracks[0].likes || 0 }}</span>
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
                  <span class="text-subtitle-2 text-grey-lighten-1">{{ $t(stat.label) }}</span>
                  <span class="font-weight-black text-white">{{ stat.percentage }}%</span>
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
                <div class="text-overline font-weight-bold text-white-50 mb-1 letter-spacing-1">{{ $t('Dashboard.PlaysOverview') }}</div>
                <div class="text-h5 font-weight-black text-white tracking-tight">{{ $t('Dashboard.Last7Days') }}</div>
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
              <v-card class="glass-table-card rounded-xl elevation-12 overflow-hidden">
                <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

                <v-table v-else class="bg-transparent custom-table" theme="dark">
                  <thead>
                    <tr>
                      <th class="text-left text-overline text-grey-lighten-1 py-4 px-6">Track Info</th>
                      <th class="text-left text-overline text-grey-lighten-1 py-4">Engagement</th>
                      <th class="text-left text-overline text-grey-lighten-1 py-4">Pricing</th>
                      <th class="text-left text-overline text-grey-lighten-1 py-4">Status</th>
                      <th class="text-right text-overline text-grey-lighten-1 py-4 px-6">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="track in tracks" :key="track._id" class="table-row-hover">
                      <td class="py-5 px-6">
                        <div class="d-flex align-center">
                          <div class="art-wrapper mr-5">
                            <v-img :src="getApiUrl(track.art)" cover class="rounded-lg shadow-img"></v-img>
                            <div class="play-overlay d-flex align-center justify-center">
                              <v-icon color="white" size="32">mdi-play</v-icon>
                            </div>
                          </div>
                          <div>
                            <div class="text-h6 font-weight-black text-white mb-1 tracking-tight">{{ track.name }}</div>
                            <div class="d-flex align-center gap-2">
                              <v-chip size="small" variant="flat" color="rgba(255,255,255,0.05)" class="font-weight-medium text-grey-lighten-1 border-white-10">{{ track.bpm ? `${track.bpm} BPM` : 'No BPM' }}</v-chip>
                              <v-chip size="small" variant="flat" color="rgba(255,255,255,0.05)" class="font-weight-medium text-grey-lighten-1 border-white-10">{{ track.key || 'No Key' }}</v-chip>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-center">
                          <div class="stat-pill bg-white-5 mr-3">
                            <v-icon size="16" class="text-info mr-2">mdi-play</v-icon>
                            <span class="font-weight-bold text-white">{{ track.views || 0 }}</span>
                          </div>
                          <div class="stat-pill bg-white-5">
                            <v-icon size="16" class="text-error mr-2">mdi-heart</v-icon>
                            <span class="font-weight-bold text-white">{{ track.likes || 0 }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-center gap-1">
                          <div class="price-box">${{ track.priceBasic || '-' }}</div>
                          <div class="price-box">${{ track.pricePremium || '-' }}</div>
                          <div class="price-box">${{ track.priceUnlimited || '-' }}</div>
                          <div class="price-box primary-border">${{ track.priceExclusive || '-' }}</div>
                        </div>
                      </td>
                      <td>
                        <v-chip size="small" :color="track.status === 'public' ? 'success' : 'warning'" variant="outlined" class="font-weight-bold border-2 text-uppercase">
                          <v-icon start size="14">{{ track.status === 'public' ? 'mdi-earth' : 'mdi-lock' }}</v-icon>
                          {{ track.status }}
                        </v-chip>
                      </td>
                      <td class="text-right px-6">
                        <v-btn icon="mdi-pencil" variant="tonal" size="small" color="grey-lighten-1" class="mr-2 btn-hover-primary"></v-btn>
                        <v-btn 
                          icon="mdi-delete" 
                          variant="tonal" 
                          size="small" 
                          color="error"
                          class="btn-hover-error"
                          :loading="isDeleting === track._id"
                          @click="confirmDelete(track._id)"
                        ></v-btn>
                      </td>
                    </tr>
                    <tr v-if="tracks.length === 0">
                      <td colspan="5" class="text-center py-16">
                        <v-icon size="64" color="rgba(255,255,255,0.1)" class="mb-4">mdi-music-note-off</v-icon>
                        <div class="text-h5 font-weight-bold text-white mb-2">{{ $t('Dashboard.NoTracksUploaded') }}</div>
                        <p class="text-grey mb-6">Start building your catalog and share your beats with the world.</p>
                        <v-btn color="primary" @click="showUploadModal = true" class="rounded-pill font-weight-bold px-8">Upload First Beat</v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </v-window-item>

            <!-- SOUNDKITS TAB -->
            <v-window-item value="soundkits">
              <v-row v-if="soundkits.length > 0">
                <!-- Mapped Soundkits will go here when implemented -->
                <v-col cols="12" sm="6" md="4" lg="3" v-for="kit in soundkits" :key="kit._id">
                  <v-card class="glass-card rounded-xl elevation-10 overflow-hidden kit-card">
                    <v-img :src="getApiUrl(kit.thumbnailUrl)" height="200" cover class="kit-img"></v-img>
                    <v-card-text class="pa-4">
                      <div class="text-h6 font-weight-bold text-white mb-1">{{ kit.title }}</div>
                      <div class="text-caption text-grey mb-4 text-truncate">{{ kit.description }}</div>
                      <div class="d-flex align-center justify-space-between">
                        <v-chip size="small" color="info" variant="tonal" class="font-weight-bold">Kit</v-chip>
                        <v-btn icon="mdi-dots-vertical" variant="text" size="small" color="grey"></v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Empty State for Soundkits -->
              <v-card v-else class="glass-table-card rounded-xl elevation-12 text-center py-16">
                <v-icon size="80" color="rgba(255,255,255,0.05)" class="mb-4">mdi-package-variant-closed</v-icon>
                <div class="text-h4 font-weight-black text-white mb-2">{{ $t('Dashboard.NoSoundkitsUploaded') }}</div>
                <p class="text-grey mb-8 text-body-1">Create and sell your own drum kits, loop packs, and presets.</p>
                <v-btn color="white" variant="outlined" size="x-large" class="rounded-pill font-weight-bold px-8 border-white-20 glass-btn">
                  <v-icon start>mdi-plus</v-icon> Create Soundkit
                </v-btn>
              </v-card>
            </v-window-item>

          </v-window>
        </v-col>
      </v-row>
      
      <UploadTrackModal v-model="showUploadModal" @uploaded="fetchTracks" />

      <!-- Delete Dialog & Snackbar omitted for brevity (kept same logic) -->
      <v-dialog v-model="showDeleteConfirm" max-width="400" persistent>
        <v-card theme="dark" class="bg-grey-darken-4 rounded-xl border-white-10 elevation-24">
          <v-card-title class="text-h6 pt-6 px-6 font-weight-bold text-white">
            <v-icon color="error" class="mr-2">mdi-alert</v-icon> {{ $t('Dashboard.DeleteTrack') }}
          </v-card-title>
          <v-card-text class="text-body-1 text-grey-lighten-1 px-6 pt-2 pb-6">
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

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top" :timeout="3000" class="mt-4 rounded-lg">
        <div class="d-flex align-center font-weight-bold">
          <v-icon start size="20">{{ snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
          {{ snackbar.text }}
        </div>
      </v-snackbar>

    </v-container>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/axios'
import UploadTrackModal from '@/components/Forms/UploadTrackModal.vue'
import { resolveMediaUrl } from '@/utils/url'

const { t, locale } = useI18n()
const auth = useAuthStore()
const showUploadModal = ref(false)
const tracks = ref([])
const soundkits = ref([]) // Empty for now, will implement fetch later
const loading = ref(true)
const activeTab = ref('tracks')

// Currency Formatter
const formatCurrency = (amount) => {
  const currency = locale.value === 'tr' ? 'TRY' : 'USD'
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(amount)
}

// Mock Chart Data
const chartData = [
  { label: 'Days.Mon', plays: 120, height: 20 },
  { label: 'Days.Tue', plays: 450, height: 65 },
  { label: 'Days.Wed', plays: 280, height: 40 },
  { label: 'Days.Thu', plays: 800, height: 100 },
  { label: 'Days.Fri', plays: 550, height: 75 },
  { label: 'Days.Sat', plays: 900, height: 95 },
  { label: 'Days.Sun', plays: 340, height: 50 },
]

// Mock Audience Data
const audienceData = [
  { label: 'Countries.US', percentage: 45 },
  { label: 'Countries.TR', percentage: 30 },
  { label: 'Countries.DE', percentage: 15 },
]

// Computed Stats
const totalViews = computed(() => tracks.value.reduce((acc, t) => acc + (t.views || 0), 0))
const totalLikes = computed(() => tracks.value.reduce((acc, t) => acc + (t.likes || 0), 0))

const fetchTracks = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/track/dashboard')
    tracks.value = data.tracks || []
  } catch (error) {
    console.error("Failed to fetch tracks", error)
  } finally {
    loading.value = false
  }
}

const isDeleting = ref(null)
const showDeleteConfirm = ref(false)
const trackToDelete = ref(null)
const snackbar = ref({ show: false, text: '', color: 'success' })

const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const confirmDelete = (id) => {
  trackToDelete.value = id
  showDeleteConfirm.value = true
}

const executeDelete = async () => {
  if (!trackToDelete.value) return;
  const id = trackToDelete.value;
  isDeleting.value = id;
  
  try {
    await api.delete(`/track/${id}`);
    tracks.value = tracks.value.filter(t => t._id !== id);
    showSnackbar(t('Dashboard.TrackDeletedSuccess'));
  } catch (error) {
    console.error("Failed to delete track", error);
    showSnackbar(t('Dashboard.TrackDeletedError'), 'error');
  } finally {
    isDeleting.value = null;
    showDeleteConfirm.value = false;
    trackToDelete.value = null;
  }
}

// Helper to format backend URLs correctly
const getApiUrl = (path) => resolveMediaUrl(path, 'user')

onMounted(() => {
  fetchTracks()
  // fetchSoundkits() could be called here when the endpoint is ready
})
</script>

<style scoped>
/* Hero & Layout */
.bg-black {
  background-color: #050505 !important;
}

.hero-banner {
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.15) 0%, rgba(0, 0, 0, 1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 280px;
  position: relative;
}

.hero-title {
  letter-spacing: -1px !important;
}

.content-container {
  margin-top: -80px;
  position: relative;
  z-index: 2;
}

/* Glassmorphism Cards */
.glass-card {
  background: rgba(30, 30, 30, 0.6) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.gradient-card {
  background: linear-gradient(135deg, rgba(211,47,47,0.4) 0%, rgba(0,0,0,1) 100%) !important;
  position: relative;
}
.gradient-overlay {
  background: radial-gradient(circle at top right, rgba(211,47,47,0.15) 0%, transparent 60%);
  position: relative;
  z-index: 1;
}
.text-white-70 { color: rgba(255, 255, 255, 0.7) !important; }

.top-track-art {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.top-track-art:hover {
  transform: scale(1.05);
}
.top-track-overlay {
  position: absolute;
  inset: 0;
  background: rgba(211,47,47,0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.top-track-art:hover .top-track-overlay { opacity: 1; }

.glass-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(211, 47, 47, 0.1) !important;
}

.glass-table-card {
  background: rgba(18, 18, 18, 0.8) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Stat Icons */
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

/* Buttons & Chips */
.border-white-20 {
  border-color: rgba(255, 255, 255, 0.2) !important;
}
.border-white-10 {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.border-2 {
  border-width: 2px !important;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.glow-primary {
  box-shadow: 0 0 20px rgba(211, 47, 47, 0.4) !important;
}

/* Custom Table Styles */
.custom-table th {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  background: transparent !important;
  letter-spacing: 1px;
}
.custom-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
}
.table-row-hover {
  transition: background-color 0.2s ease;
}
.table-row-hover:hover {
  background-color: rgba(255, 255, 255, 0.02) !important;
}

/* Track Art & Overlays */
.art-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
}
.shadow-img {
  width: 100%;
  height: 100%;
}
.play-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}
.art-wrapper:hover .play-overlay {
  opacity: 1;
}

.tracking-tight {
  letter-spacing: -0.5px;
}
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

/* Stat Pills */
.bg-white-5 {
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px;
  border-radius: 20px;
}

/* Pricing Boxes */
.price-box {
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85rem;
}
.primary-border {
  border: 1px solid var(--v-primary-base);
  color: var(--v-primary-base);
}

.btn-hover-primary:hover { color: var(--v-primary-base) !important; background: rgba(211, 47, 47, 0.1) !important; }
.btn-hover-error:hover { color: #f44336 !important; background: rgba(244, 67, 54, 0.1) !important; }

/* CSS Chart */
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
}
.chart-bar:hover {
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
  opacity: 1;
  box-shadow: 0 0 25px rgba(var(--v-theme-primary), 0.5);
  transform: scaleY(1.02);
  transform-origin: bottom;
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
.chart-bar:hover .chart-tooltip {
  opacity: 1;
  top: -45px;
}

/* Kit Cards */
.kit-card {
  transition: transform 0.3s ease;
}
.kit-card:hover {
  transform: translateY(-8px);
}
.kit-img {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>