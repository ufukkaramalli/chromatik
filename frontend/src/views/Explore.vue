<template>
  <v-main class="explore-page">
    <v-container class="py-10 py-md-14 px-3 px-sm-6 position-relative" style="max-width: 1440px;">
      <!-- Hero -->
      <ExploreHeroHeader />

      <!-- Tabs -->
      <v-tabs
        id="explore-tabs"
        v-model="state.tab"
        color="primary"
        align-tabs="center"
        class="mb-8 border-b"
        show-arrows
      >
        <v-tab
          v-for="tab in tabs"
          :id="`explore-tab-${tab.value}`"
          :key="tab.value"
          :value="tab.value"
          :to="{ name: 'Explore', params: { tab: tab.value } }"
          :prepend-icon="tab.icon"
          class="text-none font-weight-bold"
        >
          {{ tab.label }}
        </v-tab>
      </v-tabs>

      <v-window v-model="state.tab" :touch="false">
        <!-- TRACKS -->
        <v-window-item value="tracks">
          <ExploreTracksTab
            v-model:filters="state.filters"
            v-model:sort="state.sort"
            :md-and-up="mdAndUp"
            :facets="facets"
            :facets-loading="facetsLoading"
            :bpm-bounds="bpmBounds"
            :price-bounds="priceBounds"
            :active-filters="activeFilters"
            :track-sort-items="trackSortItems"
            :tracks="tracks"
            :page-size="pageSize"
            @open-filters="filterSheet = true"
            @reset-filters="resetFilters"
          />
        </v-window-item>

        <!-- PRODUCERS -->
        <v-window-item value="producers">
          <ExploreProducersTab
            v-model:psort="state.psort"
            :producers="producers"
            :producer-sort-items="producerSortItems"
            :page-size="pageSize"
          />
        </v-window-item>

        <!-- SOUNDKITS -->
        <v-window-item value="soundkits">
          <ExploreSoundkitsTab
            v-model:ksort="state.ksort"
            :soundkits="soundkits"
            :soundkit-sort-items="soundkitSortItems"
            :page-size="pageSize"
          />
        </v-window-item>
      </v-window>
    </v-container>

    <!-- Mobile filters -->
    <ExploreMobileFilterSheet
      v-model="filterSheet"
      v-model:filters="state.filters"
      :facets="facets"
      :facets-loading="facetsLoading"
      :bpm-bounds="bpmBounds"
      :price-bounds="priceBounds"
      :has-active-filters="activeFilters.length > 0"
      :loading="tracks.state.loading"
      :total-tracks="tracks.state.total"
      @reset-filters="resetFilters"
    />
  </v-main>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useExplore } from '@/composables/explore/useExplore'
import ExploreHeroHeader from '@/components/Explore/ExploreHeroHeader.vue'
import ExploreTracksTab from '@/components/Explore/ExploreTracksTab.vue'
import ExploreProducersTab from '@/components/Explore/ExploreProducersTab.vue'
import ExploreSoundkitsTab from '@/components/Explore/ExploreSoundkitsTab.vue'
import ExploreMobileFilterSheet from '@/components/Explore/ExploreMobileFilterSheet.vue'

const { mdAndUp } = useDisplay()

const {
  state,
  filterSheet,
  facets,
  facetsLoading,
  bpmBounds,
  priceBounds,
  activeFilters,
  tabs,
  trackSortItems,
  producerSortItems,
  soundkitSortItems,
  tracks,
  producers,
  soundkits,
  resetFilters,
  pageSize
} = useExplore()
</script>

<style scoped>
.explore-page {
  position: relative;
  overflow: hidden;
}
</style>
