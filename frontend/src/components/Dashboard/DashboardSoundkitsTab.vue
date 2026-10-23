<template>
  <div>
    <v-row v-if="soundkits.length > 0">
      <v-col cols="12" sm="6" md="4" lg="3" v-for="kit in soundkits" :key="kit._id">
        <v-card class="glass-card rounded-xl elevation-10 overflow-hidden kit-card">
          <v-img :src="getApiUrl(kit.thumbnailUrl)" height="200" cover class="kit-img"></v-img>
          <v-card-text class="pa-4">
            <div class="text-h6 font-weight-bold text-high-emphasis mb-1">{{ kit.title }}</div>
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
      <div class="text-h4 font-weight-black text-high-emphasis mb-2">{{ $t('Dashboard.NoSoundkitsUploaded') }}</div>
      <p class="text-grey mb-8 text-body-1">Create and sell your own drum kits, loop packs, and presets.</p>
      <v-btn variant="outlined" size="x-large" class="rounded-pill font-weight-bold px-8 border-white-20 glass-btn">
        <v-icon start>mdi-plus</v-icon> Create Soundkit
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  soundkits: any[]
  getApiUrl: (path: string) => string
}>()
</script>

<style scoped lang="scss">
.border-white-20 {
  border-color: rgba(var(--v-border-color), 0.2) !important;
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.75) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.glass-table-card {
  background: rgba(var(--v-theme-surface), 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
  }
}

.kit-card {
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-8px);
  }
}

.kit-img {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
