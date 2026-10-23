<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3 mb-5">
      <div class="text-body-2 text-medium-emphasis">
        <template v-if="soundkits.state.loaded">
          {{ $t('Explore.Soundkits.Results', { count: soundkits.state.total }) }}
        </template>
      </div>
      <v-spacer />
      <v-select
        id="search-soundkit-sort"
        :model-value="soundkitSort"
        :items="soundkitSortItems"
        :aria-label="$t('Explore.Sort.Label')"
        prepend-inner-icon="mdi-sort"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
        style="max-width: 240px; min-width: 200px;"
        @update:model-value="$emit('update:soundkitSort', $event)"
      />
    </div>

    <v-alert v-if="soundkits.state.error" type="error" variant="tonal" rounded="lg" class="mb-4">
      {{ $t('Explore.Error') }}
      <template #append>
        <v-btn variant="text" size="small" class="text-none" @click="soundkits.load(true)">
          {{ $t('Explore.Retry') }}
        </v-btn>
      </template>
    </v-alert>

    <v-row v-if="soundkits.state.loading && !soundkits.state.items.length">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="image, heading, text" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-row v-else-if="soundkits.state.items.length" :class="{ 'opacity-50': soundkits.state.loading }">
      <v-col
        v-for="kit in soundkits.state.items"
        :key="kit._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <SoundkitCard :kit="kit" />
      </v-col>
    </v-row>

    <ExploreEmpty
      v-else-if="soundkits.state.loaded && !soundkits.state.error"
      icon="mdi-folder-music-outline"
      :title="$t('Explore.Soundkits.EmptyTitle')"
      :text="$t('Explore.Soundkits.EmptyDesc')"
    />

    <ExploreLoadMore
      id="search-soundkits-more"
      :shown="soundkits.state.items.length"
      :total="soundkits.state.total"
      :has-more="soundkits.state.hasMore"
      :loading="soundkits.state.loadingMore"
      :page-size="pageSize"
      @load="soundkits.load(false)"
    />
  </div>
</template>

<script setup lang="ts">
import SoundkitCard from '@/components/Explore/SoundkitCard.vue'
import ExploreEmpty from '@/components/Explore/ExploreEmpty.vue'
import ExploreLoadMore from '@/components/Explore/ExploreLoadMore.vue'
import type { PagedList } from '@/composables/search/useSearch'

defineProps<{
  soundkits: PagedList
  soundkitSort: string
  soundkitSortItems: Array<{ value: string; title: string }>
  pageSize: number
}>()

defineEmits<{
  (e: 'update:soundkitSort', val: string): void
}>()
</script>
