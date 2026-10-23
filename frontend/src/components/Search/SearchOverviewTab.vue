<template>
  <div>
    <!-- Global Loading state -->
    <div v-if="isInitialLoading" class="py-8">
      <v-skeleton-loader type="heading, text, paragraph" class="bg-transparent mb-6" />
      <v-row dense>
        <v-col v-for="n in 4" :key="n" cols="6" sm="4" lg="3">
          <BoxPlayer loading />
        </v-col>
      </v-row>
    </div>

    <!-- Global Empty state -->
    <ExploreEmpty
      v-else-if="allAreEmpty"
      icon="mdi-magnify-remove-outline"
      :title="$t('Search.EmptyTitle', { query: cleanQuery })"
      :text="$t('Search.EmptyDesc')"
    >
      <div class="d-flex justify-center ga-3 mt-4 flex-wrap">
        <v-btn
          variant="outlined"
          rounded="pill"
          class="text-none"
          @click="$emit('clear-search')"
        >
          {{ $t('Search.ClearSearch') }}
        </v-btn>
        <v-btn
          :to="{ name: 'Explore' }"
          color="primary"
          rounded="pill"
          class="text-none font-weight-bold"
          prepend-icon="mdi-compass"
        >
          {{ $t('Search.GoToExplore') }}
        </v-btn>
      </div>
    </ExploreEmpty>

    <!-- Results sections -->
    <div v-else>
      <!-- Top Beats section -->
      <section v-if="tracks.state.items.length" class="mb-10">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-music-note-outline</v-icon>
            <h2 class="text-h6 font-weight-bold text-high-emphasis mb-0">{{ $t('Search.Sections.TopTracks') }}</h2>
            <v-chip size="x-small" variant="tonal" color="primary">{{ tracks.state.total }}</v-chip>
          </div>
          <v-btn
            v-if="tracks.state.total > 4"
            variant="text"
            color="primary"
            size="small"
            class="text-none font-weight-bold"
            append-icon="mdi-arrow-right"
            @click="$emit('switch-tab', 'tracks')"
          >
            {{ $t('Search.ViewAllTracks', { count: tracks.state.total }) }}
          </v-btn>
        </div>

        <v-row dense>
          <v-col
            v-for="(track, i) in tracks.state.items.slice(0, 8)"
            :key="track._id"
            cols="6"
            sm="4"
            lg="3"
          >
            <BoxPlayer :track="track" :track-list="tracks.state.items" :index="i" />
          </v-col>
        </v-row>
      </section>

      <!-- Matching Producers section -->
      <section v-if="producers.state.items.length" class="mb-10">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-account-music-outline</v-icon>
            <h2 class="text-h6 font-weight-bold text-high-emphasis mb-0">{{ $t('Search.Sections.Producers') }}</h2>
            <v-chip size="x-small" variant="tonal" color="primary">{{ producers.state.total }}</v-chip>
          </div>
          <v-btn
            v-if="producers.state.total > 4"
            variant="text"
            color="primary"
            size="small"
            class="text-none font-weight-bold"
            append-icon="mdi-arrow-right"
            @click="$emit('switch-tab', 'producers')"
          >
            {{ $t('Search.ViewAllProducers', { count: producers.state.total }) }}
          </v-btn>
        </div>

        <v-row>
          <v-col
            v-for="producer in producers.state.items.slice(0, 4)"
            :key="producer._id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <ProducerCard :producer="producer" />
          </v-col>
        </v-row>
      </section>

      <!-- Matching Soundkits section -->
      <section v-if="soundkits.state.items.length" class="mb-10">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-folder-music-outline</v-icon>
            <h2 class="text-h6 font-weight-bold text-high-emphasis mb-0">{{ $t('Search.Sections.Soundkits') }}</h2>
            <v-chip size="x-small" variant="tonal" color="primary">{{ soundkits.state.total }}</v-chip>
          </div>
          <v-btn
            v-if="soundkits.state.total > 4"
            variant="text"
            color="primary"
            size="small"
            class="text-none font-weight-bold"
            append-icon="mdi-arrow-right"
            @click="$emit('switch-tab', 'soundkits')"
          >
            {{ $t('Search.ViewAllSoundkits', { count: soundkits.state.total }) }}
          </v-btn>
        </div>

        <v-row>
          <v-col
            v-for="kit in soundkits.state.items.slice(0, 4)"
            :key="kit._id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <SoundkitCard :kit="kit" />
          </v-col>
        </v-row>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import ProducerCard from '@/components/Explore/ProducerCard.vue'
import SoundkitCard from '@/components/Explore/SoundkitCard.vue'
import ExploreEmpty from '@/components/Explore/ExploreEmpty.vue'
import type { PagedList } from '@/composables/search/useSearch'

defineProps<{
  isInitialLoading: boolean
  allAreEmpty: boolean
  cleanQuery: string
  tracks: PagedList
  producers: PagedList
  soundkits: PagedList
}>()

defineEmits<{
  (e: 'clear-search'): void
  (e: 'switch-tab', tab: 'tracks' | 'producers' | 'soundkits'): void
}>()
</script>
