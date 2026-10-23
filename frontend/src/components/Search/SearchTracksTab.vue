<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3 mb-5">
      <div class="text-body-2 text-medium-emphasis">
        <template v-if="tracks.state.loaded">
          {{ $t('Explore.Tracks.Results', { count: tracks.state.total }) }}
        </template>
      </div>
      <v-spacer />
      <v-select
        id="search-track-sort"
        :model-value="trackSort"
        :items="trackSortItems"
        :aria-label="$t('Explore.Sort.Label')"
        prepend-inner-icon="mdi-sort"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
        style="max-width: 240px; min-width: 200px;"
        @update:model-value="$emit('update:trackSort', $event)"
      />
    </div>

    <v-alert v-if="tracks.state.error" type="error" variant="tonal" rounded="lg" class="mb-4">
      {{ $t('Explore.Error') }}
      <template #append>
        <v-btn variant="text" size="small" class="text-none" @click="tracks.load(true)">
          {{ $t('Explore.Retry') }}
        </v-btn>
      </template>
    </v-alert>

    <v-row v-if="tracks.state.loading && !tracks.state.items.length" dense>
      <v-col v-for="n in 8" :key="n" cols="6" sm="4" lg="3">
        <BoxPlayer loading />
      </v-col>
    </v-row>

    <v-row v-else-if="tracks.state.items.length" dense :class="{ 'opacity-50': tracks.state.loading }">
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
    />

    <ExploreLoadMore
      id="search-tracks-more"
      :shown="tracks.state.items.length"
      :total="tracks.state.total"
      :has-more="tracks.state.hasMore"
      :loading="tracks.state.loadingMore"
      :page-size="pageSize"
      @load="tracks.load(false)"
    />
  </div>
</template>

<script setup lang="ts">
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import ExploreEmpty from '@/components/Explore/ExploreEmpty.vue'
import ExploreLoadMore from '@/components/Explore/ExploreLoadMore.vue'
import type { PagedList } from '@/composables/search/useSearch'

defineProps<{
  tracks: PagedList
  trackSort: string
  trackSortItems: Array<{ value: string; title: string }>
  pageSize: number
}>()

defineEmits<{
  (e: 'update:trackSort', val: string): void
}>()
</script>
