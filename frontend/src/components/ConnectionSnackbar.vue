<template>
  <v-snackbar
    id="connection-snackbar"
    v-model="noticeVisible"
    location="bottom center"
    variant="tonal"
    rounded="pill"
    :color="isRestored ? 'success' : 'warning'"
    :timeout="isRestored ? 2500 : 6000"
    class="mb-16"
  >
    <div class="d-flex align-center ga-3">
      <v-icon size="20">{{ isRestored ? 'mdi-wifi-check' : 'mdi-wifi-alert' }}</v-icon>
      <span class="text-body-2 font-weight-medium">
        {{ isRestored ? $t('Connection.Restored') : $t('Connection.WriteFailed') }}
      </span>
    </div>

    <template #actions>
      <v-btn
        v-if="!isRestored"
        id="connection-snackbar-dismiss"
        variant="text"
        size="small"
        rounded="pill"
        class="text-none font-weight-bold"
        @click="system.dismissNotice()"
      >
        {{ $t('Connection.Dismiss') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '@/stores/systemStore'

const system = useSystemStore()
const { notice, noticeVisible } = storeToRefs(system)

const isRestored = computed(() => notice.value === 'restored')
</script>
