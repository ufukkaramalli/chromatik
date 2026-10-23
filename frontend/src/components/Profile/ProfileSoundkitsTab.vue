<template>
  <div>
    <v-row v-if="soundkits && soundkits.length > 0">
      <v-col
        v-for="kit in soundkits"
        :key="kit._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="profile-card-col"
      >
        <v-card class="glass-card rounded-xl elevation-8 h-100 position-relative track-card hover-card overflow-hidden">
          <div class="track-image-wrapper">
            <v-img :src="kit.thumbnailUrl || '/no-photo.jpg'" height="200" cover class="align-end" draggable="false">
              <div class="track-play-overlay d-flex align-center justify-center">
                <v-btn icon color="primary" size="large" elevation="8">
                  <v-icon size="x-large">mdi-download</v-icon>
                </v-btn>
              </div>
            </v-img>
            <div class="price-tag kit-tag px-3 py-1 font-weight-black">
              ${{ kit.price || '0' }}
            </div>
          </div>
          <v-card-text class="pa-4 text-center">
            <div class="text-h6 font-weight-black text-high-emphasis text-truncate mb-1">{{ kit.title }}</div>
            <div class="text-caption text-medium-emphasis text-truncate">{{ kit.description || 'Soundkit' }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div v-else class="text-center py-12 opacity-50">
      <v-icon size="64" color="grey" class="mb-4">mdi-folder-hidden</v-icon>
      <div class="text-h6 font-weight-medium">{{ $t('Profile.NoSoundkits') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  soundkits: any[]
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

.glass-card {
  background: rgba(20, 20, 25, 0.6) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;

  .v-theme--light & {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }
}

.hover-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 15px rgba(var(--v-theme-primary), 0.2) !important;
    border-color: rgba(var(--v-theme-primary), 0.5) !important;
    z-index: 10;

    .v-theme--light & {
      box-shadow: 0 15px 30px rgba(0,0,0,0.08), 0 0 15px rgba(var(--v-theme-primary), 0.2) !important;
    }

    .track-play-overlay {
      opacity: 1;
    }
  }
}

.track-image-wrapper {
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;

  :deep(img) {
    user-select: none;
    -webkit-user-select: none;
    pointer-events: none;
  }
}

.track-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}

.price-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(var(--v-theme-primary), 0.9);
  color: white;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  font-size: 0.9rem;
}

.kit-tag {
  background: rgba(255, 255, 255, 0.9);
  color: black;
}
</style>
