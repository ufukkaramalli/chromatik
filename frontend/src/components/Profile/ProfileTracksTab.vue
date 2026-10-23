<template>
  <div>
    <v-row v-if="tracks && tracks.length > 0">
      <v-col
        v-for="(track, idx) in tracks"
        :key="track.id || track._id"
        cols="12"
        sm="6"
        md="4"
        lg="2"
        class="profile-card-col"
      >
        <BoxPlayer
          :track="track"
          :theme="theme"
          :track-list="tracks"
          :index="idx"
        />
      </v-col>
    </v-row>
    <div v-else class="text-center py-12 opacity-50">
      <v-icon size="64" color="grey" class="mb-4">mdi-music-off</v-icon>
      <div class="text-h6 font-weight-medium">{{ $t('Profile.NoTracks') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import type { TrackLike } from '@/types/audio'

defineProps<{
  tracks: TrackLike[]
  theme?: string
}>()
</script>

<style scoped lang="scss">
.profile-card-col {
  position: relative;
  z-index: 1;
  transition: z-index 0.2s;

  &:hover,
  &:focus-within {
    z-index: 10;
  }
}
</style>
