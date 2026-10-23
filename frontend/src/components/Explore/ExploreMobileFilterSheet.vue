<template>
  <v-bottom-sheet :model-value="modelValue" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card rounded="t-xl" color="surface">
      <v-card-text class="pa-5">
        <ExploreFilters
          :model-value="filters"
          :facets="facets"
          :loading="facetsLoading"
          :bpm-bounds="bpmBounds"
          :price-bounds="priceBounds"
          :has-active="hasActiveFilters"
          @update:model-value="$emit('update:filters', $event)"
          @reset="$emit('reset-filters')"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-btn
          id="explore-show-results"
          color="primary"
          variant="flat"
          rounded="pill"
          block
          size="large"
          class="text-none font-weight-bold"
          :loading="loading"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('Explore.Filters.ShowResults', { count: totalTracks }) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import ExploreFilters from '@/components/Explore/ExploreFilters.vue'
import type { ExploreFiltersState } from '@/composables/explore/useExplore'

defineProps<{
  modelValue: boolean
  filters: ExploreFiltersState
  facets: any
  facetsLoading: boolean
  bpmBounds: [number, number]
  priceBounds: [number, number]
  hasActiveFilters: boolean
  loading: boolean
  totalTracks: number
}>()

defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'update:filters', val: ExploreFiltersState): void
  (e: 'reset-filters'): void
}>()
</script>
