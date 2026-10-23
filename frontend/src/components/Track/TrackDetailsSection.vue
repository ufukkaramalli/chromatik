<template>
  <div class="track-details-section">
    <!-- Description -->
    <div class="mb-8">
      <h3 class="text-h5 font-weight-black text-high-emphasis mb-6 d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-text-box-outline</v-icon>
        {{ $t('Track.Description') }}
      </h3>
      <div class="glass-card rounded-xl pa-8 text-body-1 text-medium-emphasis description-box">
        {{ track.description || $t('Track.NoDescription') }}
      </div>
    </div>
    
    <!-- Genres & Moods -->
    <v-row class="mb-8" v-if="(track.genres && track.genres.length) || (track.moods && track.moods.length)">
      <v-col cols="12" sm="6" v-if="track.genres && track.genres.length">
        <h3 class="text-h5 font-weight-black text-high-emphasis mb-4 d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-music-box-multiple</v-icon>
          {{ $t('Track.Genres') }}
        </h3>
        <div class="d-flex flex-wrap gap-2">
          <v-chip v-for="genre in track.genres" :key="genre" color="primary" variant="tonal" class="font-weight-bold">
            {{ genre }}
          </v-chip>
        </div>
      </v-col>

      <v-col cols="12" sm="6" v-if="track.moods && track.moods.length">
        <h3 class="text-h5 font-weight-black text-high-emphasis mb-4 d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-emoticon</v-icon>
          {{ $t('Track.Moods') }}
        </h3>
        <div class="d-flex flex-wrap gap-2">
          <v-chip v-for="mood in track.moods" :key="mood" color="secondary" variant="tonal" class="font-weight-bold">
            {{ mood }}
          </v-chip>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types/audio'

defineProps<{
  track: Partial<Track>
}>()
</script>

<style scoped lang="scss">
.gap-2 { gap: 8px; }

.glass-card {
  background: rgba(20, 20, 25, 0.6) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;

  .v-theme--light & {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }
}

.description-box {
  line-height: 1.8;
  font-size: 1.05rem;
}
</style>
