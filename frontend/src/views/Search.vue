<template>
  <v-main class="search-page">
    <v-container class="py-8 py-md-12 px-3 px-sm-6 position-relative" style="max-width: 1440px;">
      <!-- Search Input Header -->
      <SearchHeader
        v-model="searchQuery"
        :clean-query="cleanQuery"
        :trending-tags="trendingTags"
        @enter="handleEnter"
        @select-tag="setQuery"
      />

      <!-- Empty Query State (Initial Guide) -->
      <SearchEmptyGuide v-if="!cleanQuery" />

      <!-- Results Section (when query is present) -->
      <template v-else>
        <!-- Tabs -->
        <v-tabs
          id="search-tabs"
          v-model="activeTab"
          color="primary"
          align-tabs="center"
          class="mb-6 border-b"
          show-arrows
        >
          <v-tab value="all" class="text-none font-weight-bold" prepend-icon="mdi-view-grid-outline">
            {{ $t('Search.Tabs.All') }}
          </v-tab>
          <v-tab value="tracks" class="text-none font-weight-bold" prepend-icon="mdi-music-note-outline">
            {{ $t('Search.Tabs.Tracks') }}
            <v-chip size="x-small" variant="tonal" class="ml-2" v-if="tracks.state.loaded">
              {{ tracks.state.total }}
            </v-chip>
          </v-tab>
          <v-tab value="producers" class="text-none font-weight-bold" prepend-icon="mdi-account-music-outline">
            {{ $t('Search.Tabs.Producers') }}
            <v-chip size="x-small" variant="tonal" class="ml-2" v-if="producers.state.loaded">
              {{ producers.state.total }}
            </v-chip>
          </v-tab>
          <v-tab value="soundkits" class="text-none font-weight-bold" prepend-icon="mdi-folder-music-outline">
            {{ $t('Search.Tabs.Soundkits') }}
            <v-chip size="x-small" variant="tonal" class="ml-2" v-if="soundkits.state.loaded">
              {{ soundkits.state.total }}
            </v-chip>
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab" :touch="false">
          <!-- ALL (OVERVIEW) TAB -->
          <v-window-item value="all">
            <SearchOverviewTab
              :is-initial-loading="isInitialLoading"
              :all-are-empty="allAreEmpty"
              :clean-query="cleanQuery"
              :tracks="tracks"
              :producers="producers"
              :soundkits="soundkits"
              @clear-search="searchQuery = ''"
              @switch-tab="activeTab = $event"
            />
          </v-window-item>

          <!-- TRACKS TAB -->
          <v-window-item value="tracks">
            <SearchTracksTab
              v-model:track-sort="trackSort"
              :tracks="tracks"
              :track-sort-items="trackSortItems"
              :page-size="pageSize"
            />
          </v-window-item>

          <!-- PRODUCERS TAB -->
          <v-window-item value="producers">
            <SearchProducersTab
              v-model:producer-sort="producerSort"
              :producers="producers"
              :producer-sort-items="producerSortItems"
              :page-size="pageSize"
            />
          </v-window-item>

          <!-- SOUNDKITS TAB -->
          <v-window-item value="soundkits">
            <SearchSoundkitsTab
              v-model:soundkit-sort="soundkitSort"
              :soundkits="soundkits"
              :soundkit-sort-items="soundkitSortItems"
              :page-size="pageSize"
            />
          </v-window-item>
        </v-window>
      </template>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSearch } from '@/composables/search/useSearch'
import SearchHeader from '@/components/Search/SearchHeader.vue'
import SearchEmptyGuide from '@/components/Search/SearchEmptyGuide.vue'
import SearchOverviewTab from '@/components/Search/SearchOverviewTab.vue'
import SearchTracksTab from '@/components/Search/SearchTracksTab.vue'
import SearchProducersTab from '@/components/Search/SearchProducersTab.vue'
import SearchSoundkitsTab from '@/components/Search/SearchSoundkitsTab.vue'

const {
  searchQuery,
  cleanQuery,
  activeTab,
  trackSort,
  producerSort,
  soundkitSort,
  trendingTags,
  tracks,
  producers,
  soundkits,
  isInitialLoading,
  allAreEmpty,
  trackSortItems,
  producerSortItems,
  soundkitSortItems,
  setQuery,
  handleEnter,
  pageSize
} = useSearch()
</script>

<style scoped>
.search-page {
  position: relative;
  overflow: hidden;
  min-height: 80vh;
}
</style>
