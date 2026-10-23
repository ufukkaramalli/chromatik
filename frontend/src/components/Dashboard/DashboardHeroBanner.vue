<template>
  <div class="hero-banner d-flex align-center px-6 px-md-12 pt-12 pb-16">
    <div class="hero-content w-100 d-flex flex-column flex-md-row justify-space-between align-md-center">
      <div>
        <h1 class="text-h3 font-weight-black text-high-emphasis mb-2 hero-title">
          {{ $t('Dashboard.Welcome', { name: userName || 'Producer' }) }}
        </h1>
        <p class="text-medium-emphasis text-subtitle-1">{{ $t('Dashboard.Subtitle') }}</p>
      </div>
      <div class="d-flex gap-3 mt-6 mt-md-0">
        <v-btn 
          color="primary" 
          variant="outlined" 
          prepend-icon="mdi-folder-music" 
          size="x-large" 
          class="text-none font-weight-bold rounded-lg border-2"
        >
          {{ $t('Dashboard.UploadSoundkit') }}
        </v-btn>
        <v-btn 
          color="primary" 
          prepend-icon="mdi-upload" 
          size="x-large" 
          class="text-none font-weight-bold elevation-8 rounded-lg glow-primary"
          @click="$emit('upload-beat')"
        >
          {{ $t('Dashboard.UploadBeat') }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userName?: string
}>()

defineEmits<{
  (e: 'upload-beat'): void
}>()
</script>

<style scoped lang="scss">
.gap-3 { gap: 12px; }

.border-2 {
  border-width: 2px !important;
}

.hero-banner {
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.15) 0%, rgba(0, 0, 0, 1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 280px;
  position: relative;

  .v-theme--light & {
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(248, 250, 252, 1) 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
}

.hero-title {
  letter-spacing: -1px !important;
}

.glow-primary {
  box-shadow: 0 0 20px rgba(211, 47, 47, 0.4) !important;
}
</style>
