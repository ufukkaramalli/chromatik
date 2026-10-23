<template>
  <v-card class="glass-table-card rounded-xl elevation-12 overflow-hidden">
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <v-table v-else class="bg-transparent custom-table">
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
              <div class="art-wrapper ck-art-backing mr-5">
                <v-img :src="getApiUrl(track.art)" cover class="rounded-lg shadow-img"></v-img>
                <div class="play-overlay d-flex align-center justify-center">
                  <v-icon color="white" size="32">mdi-play</v-icon>
                </div>
              </div>
              <div>
                <div class="text-h6 font-weight-black text-high-emphasis mb-1 tracking-tight">{{ track.name }}</div>
                <div class="d-flex align-center gap-2">
                  <v-chip size="small" variant="flat" color="rgba(255,255,255,0.05)" class="font-weight-medium text-medium-emphasis border-white-10">{{ track.bpm ? `${track.bpm} BPM` : 'No BPM' }}</v-chip>
                  <v-chip size="small" variant="flat" color="rgba(255,255,255,0.05)" class="font-weight-medium text-medium-emphasis border-white-10">{{ track.key || 'No Key' }}</v-chip>
                </div>
              </div>
            </div>
          </td>
          <td>
            <div class="d-flex align-center">
              <div class="stat-pill bg-white-5 mr-3">
                <v-icon size="16" class="text-info mr-2">mdi-play</v-icon>
                <span class="font-weight-bold text-high-emphasis">{{ track.views || 0 }}</span>
              </div>
              <div class="stat-pill bg-white-5">
                <v-icon size="16" class="text-error mr-2">mdi-heart</v-icon>
                <span class="font-weight-bold text-high-emphasis">{{ track.likes || 0 }}</span>
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
              @click="$emit('delete', track._id)"
            ></v-btn>
          </td>
        </tr>
        <tr v-if="tracks.length === 0">
          <td colspan="5" class="text-center py-16">
            <v-icon size="64" color="rgba(255,255,255,0.1)" class="mb-4">mdi-music-note-off</v-icon>
            <div class="text-h5 font-weight-bold text-high-emphasis mb-2">{{ $t('Dashboard.NoTracksUploaded') }}</div>
            <p class="text-grey mb-6">Start building your catalog and share your beats with the world.</p>
            <v-btn color="primary" @click="$emit('upload')" class="rounded-pill font-weight-bold px-8">Upload First Beat</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  tracks: any[]
  loading: boolean
  isDeleting: string | null
  getApiUrl: (path: string) => string
}>()

defineEmits<{
  (e: 'upload'): void
  (e: 'delete', id: string): void
}>()
</script>

<style scoped lang="scss">
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

.border-2 {
  border-width: 2px !important;
}

.border-white-10 {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.tracking-tight {
  letter-spacing: -0.5px;
}

.glass-table-card {
  background: rgba(var(--v-theme-surface), 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

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
  &:hover {
    background-color: rgba(255, 255, 255, 0.02) !important;
  }
}

.art-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;

  &:hover .play-overlay {
    opacity: 1;
  }
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

.stat-pill {
  background: rgba(var(--v-theme-on-surface), 0.05);
  padding: 4px 12px;
  border-radius: 20px;
}

.price-box {
  background: rgba(var(--v-theme-on-surface), 0.04);
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
</style>
