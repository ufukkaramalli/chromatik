<template>
  <v-dialog :model-value="modelValue" max-width="400" @update:model-value="emit('update:modelValue', $event)">
    <v-card class="glass-card rounded-xl pa-5">
      <v-card-title class="text-h6 font-weight-black text-high-emphasis pa-0 mb-3">
        {{ $t('Comments.Delete') }}
      </v-card-title>
      <v-card-text class="pa-0 mb-6 text-body-2 text-medium-emphasis">
        {{ $t('Comments.DeleteConfirm') }}
      </v-card-text>
      <v-card-actions class="pa-0 d-flex justify-end ga-2">
        <v-btn variant="text" color="medium-emphasis" rounded="pill" @click="emit('update:modelValue', false)">
          {{ $t('Comments.Cancel') }}
        </v-btn>
        <v-btn color="error" variant="flat" rounded="pill" :loading="deleting" @click="emit('confirm')">
          {{ $t('Comments.Delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  deleting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
}
</style>
