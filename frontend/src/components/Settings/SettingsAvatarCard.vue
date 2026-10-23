<template>
  <v-card class="bg-surface rounded-lg border text-center py-8 px-4 h-100">
    <h3 class="text-h6 font-weight-bold mb-6">{{ $t('Settings.ProfilePicture') }}</h3>
    <v-avatar size="150" color="surface-light" class="mb-6 elevation-4">
      <v-img :src="getApiUrl(photoUrl)" cover></v-img>
    </v-avatar>
    
    <div class="d-flex flex-column align-center gap-3">
      <v-btn
        color="primary"
        variant="flat"
        class="rounded-pill px-6 text-none"
        :loading="uploadingAvatar"
        @click="$emit('upload-click')"
      >
        <v-icon start>mdi-cloud-upload</v-icon>
        {{ $t('Settings.UploadNew') }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  photoUrl?: string
  uploadingAvatar: boolean
  getApiUrl: (path?: string) => string
}>()

defineEmits<{
  (e: 'upload-click'): void
}>()
</script>

<style scoped lang="scss">
.gap-3 {
  gap: 12px;
}
</style>
