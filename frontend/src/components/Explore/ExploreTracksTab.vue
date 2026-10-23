<template>
  <v-row>
    <!-- Desktop filter sidebar -->
    <v-col v-if="mdAndUp" cols="12" md="4" lg="3">
      <v-card
        rounded="xl"
        border
        color="surface"
        elevation="0"
        class="pa-5 explore-sidebar"
      >
        <ExploreFilters
          :model-value="filters"
          :facets="facets"
          :loading="facetsLoading"
          :bpm-bounds="bpmBounds"
          :price-bounds="priceBounds"
          :has-active="activeFilters.length > 0"
          @update:model-value="$emit('update:filters', $event)"
          @reset="$emit('reset-filters')"
        />
      </v-card>
    </v-col>

    <v-col cols="12" :md="mdAndUp ? 8 : 12" :lg="mdAndUp ? 9 : 12">
      <!-- Toolbar -->
      <div class="d-flex flex-wrap align-center ga-3 mb-4">
        <v-btn
          v-if="!mdAndUp"
          id="explore-open-filters"
          variant="tonal"
          rounded="pill"
          class="text-none font-weight-bold"
          prepend-icon="mdi-tune-variant"
          @click="$emit('open-filters')"
        >
          {{ $t('Explore.Filters.Open') }}
          <v-badge
            v-if="activeFilters.length"
            :content="activeFilters.length"
            color="primary"
            inline
          />
        </v-btn>

        <div class="text-body-2 text-medium-emphasis">
          <template v-if="tracks.state.loaded">
            {{ $t('Explore.Tracks.Results', { count: tracks.state.total }) }}
          </template>
        </div>

        <v-spacer />

        <v-select
          id="explore-track-sort"
          :model-value="sort"
          :items="trackSortItems"
          :aria-label="$t('Explore.Sort.Label')"
          prepend-inner-icon="mdi-sort"
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          style="max-width: 240px; min-width: 200px;"
          @update:model-value="$emit('update:sort', $event)"
        />
      </div>

      <!-- Active filters -->
      <div v-if="activeFilters.length" class="d-flex flex-wrap align-center ga-2 mb-5">
        <v-chip
          v-for="chip in activeFilters"
          :key="chip.id"
          size="small"
          color="primary"
          variant="tonal"
          :prepend-icon="chip.icon"
          closable
          @click:close="chip.clear()"
        >
          {{ chip.label }}
        </v-chip>
        <v-btn
          variant="text"
          size="small"
          density="comfortable"
          class="text-none"
          @click="$emit('reset-filters')"
        >
          {{ $t('Explore.Filters.ClearAll') }}
        </v-btn>
      </div>

      <v-progress-linear
        v-if="tracks.state.loading && tracks.state.items.length"
        indeterminate
        color="primary"
        height="2"
        class="mb-4"
      />

      <!-- Error -->
      <v-alert
        v-if="tracks.state.error"
        type="error"
        variant="tonal"
        rounded="lg"
        class="mb-4"
      >
        {{ $t('Explore.Error') }}
        <template #append>
          <v-btn variant="text" size="small" class="text-none" @click="tracks.load(true)">
            {{ $t('Explore.Retry') }}
          </v-btn>
        </template>
      </v-alert>

      <!-- Grid -->
      <v-row v-if="tracks.state.loading && !tracks.state.items.length" dense>
        <v-col v-for="n in 8" :key="n" cols="6" sm="4" lg="3">
          <BoxPlayer loading />
        </v-col>
      </v-row>

      <v-row
        v-else-if="tracks.state.items.length"
        dense
        :class="{ 'opacity-50': tracks.state.loading }"
      >
        <v-col
          v-for="(track, i) in tracks.state.items"
          :key="track._id"
          cols="6"
          sm="4"
          lg="3"
        >
          <BoxPlayer :track="track" :track-list="tracks.state.items" :index="i" />
        </v-col>
      </v-row>

      <ExploreEmpty
        v-else-if="tracks.state.loaded && !tracks.state.error"
        icon="mdi-music-note-off-outline"
        :title="$t('Explore.Tracks.EmptyTitle')"
        :text="$t('Explore.Tracks.EmptyDesc')"
      >
        <v-btn
          v-if="activeFilters.length"
          color="primary"
          rounded="pill"
          class="text-none font-weight-bold mt-4"
          prepend-icon="mdi-filter-remove-outline"
          @click="$emit('reset-filters')"
        >
          {{ $t('Explore.Filters.ClearAll') }}
        </v-btn>
      </ExploreEmpty>

      <ExploreLoadMore
        id="explore-tracks-more"
        :shown="tracks.state.items.length"
        :total="tracks.state.total"
        :has-more="tracks.state.hasMore"
        :loading="tracks.state.loadingMore"
        :page-size="pageSize"
        @load="tracks.load(false)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import ExploreFilters from '@/components/Explore/ExploreFilters.vue'
import ExploreEmpty from '@/components/Explore/ExploreEmpty.vue'
import ExploreLoadMore from '@/components/Explore/ExploreLoadMore.vue'
import type { PagedList, ExploreFiltersState, ActiveFilterChip } from '@/composables/explore/useExplore'

defineProps<{
  mdAndUp: boolean
  filters: ExploreFiltersState
  facets: any
  facetsLoading: boolean
  bpmBounds: [number, number]
  priceBounds: [number, number]
  activeFilters: ActiveFilterChip[]
  sort: string
  trackSortItems: Array<{ value: string; title: string }>
  tracks: PagedList
  pageSize: number
}>()

defineEmits<{
  (e: 'update:filters', val: ExploreFiltersState): void
  (e: 'update:sort', val: string): void
  (e: 'open-filters'): void
  (e: 'reset-filters'): void
}>()
</script>

<style scoped lang="scss">
.explore-sidebar {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.15) transparent;
}
</style>
