<template>
  <div v-if="visible" class="d-flex flex-column align-center ga-2 mt-8">
    <v-btn
      v-if="hasMore"
      :id="id"
      variant="tonal"
      color="primary"
      rounded="pill"
      size="large"
      class="text-none font-weight-bold px-8"
      prepend-icon="mdi-plus"
      :loading="loading"
      @click="emit('load')"
    >
      {{ $t('Explore.LoadMore') }}
    </v-btn>
    <div class="font-mono text-caption text-medium-emphasis">
      {{ $t('Explore.Showing', { shown, total }) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, default: undefined },
  shown: { type: Number, required: true },
  total: { type: Number, required: true },
  hasMore: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  pageSize: { type: Number, default: 24 }
})

const emit = defineEmits(['load'])

/** Hide entirely when everything fits on the first page. */
const visible = computed(() => props.shown > 0 && (props.hasMore || props.shown > props.pageSize))
</script>
