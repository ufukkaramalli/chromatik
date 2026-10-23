<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3 mb-5">
      <div class="text-body-2 text-medium-emphasis">
        <template v-if="producers.state.loaded">
          {{ $t('Explore.Producers.Results', { count: producers.state.total }) }}
        </template>
      </div>
      <v-spacer />
      <v-select
        id="search-producer-sort"
        :model-value="producerSort"
        :items="producerSortItems"
        :aria-label="$t('Explore.Sort.Label')"
        prepend-inner-icon="mdi-sort"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
        style="max-width: 240px; min-width: 200px;"
        @update:model-value="$emit('update:producerSort', $event)"
      />
    </div>

    <v-alert v-if="producers.state.error" type="error" variant="tonal" rounded="lg" class="mb-4">
      {{ $t('Explore.Error') }}
      <template #append>
        <v-btn variant="text" size="small" class="text-none" @click="producers.load(true)">
          {{ $t('Explore.Retry') }}
        </v-btn>
      </template>
    </v-alert>

    <v-row v-if="producers.state.loading && !producers.state.items.length">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="avatar, heading, chip@3" class="rounded-xl pa-4 d-flex flex-column align-center" />
      </v-col>
    </v-row>

    <v-row v-else-if="producers.state.items.length" :class="{ 'opacity-50': producers.state.loading }">
      <v-col
        v-for="producer in producers.state.items"
        :key="producer._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <ProducerCard :producer="producer" />
      </v-col>
    </v-row>

    <ExploreEmpty
      v-else-if="producers.state.loaded && !producers.state.error"
      icon="mdi-account-music-outline"
      :title="$t('Explore.Producers.EmptyTitle')"
      :text="$t('Explore.Producers.EmptyDesc')"
    />

    <ExploreLoadMore
      id="search-producers-more"
      :shown="producers.state.items.length"
      :total="producers.state.total"
      :has-more="producers.state.hasMore"
      :loading="producers.state.loadingMore"
      :page-size="pageSize"
      @load="producers.load(false)"
    />
  </div>
</template>

<script setup lang="ts">
import ProducerCard from '@/components/Explore/ProducerCard.vue'
import ExploreEmpty from '@/components/Explore/ExploreEmpty.vue'
import ExploreLoadMore from '@/components/Explore/ExploreLoadMore.vue'
import type { PagedList } from '@/composables/search/useSearch'

defineProps<{
  producers: PagedList
  producerSort: string
  producerSortItems: Array<{ value: string; title: string }>
  pageSize: number
}>()

defineEmits<{
  (e: 'update:producerSort', val: string): void
}>()
</script>
