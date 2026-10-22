<template>
  <v-main class="bg-black search-page">
    <!-- Ambient glow (decorative) -->
    <div class="search-glow" aria-hidden="true"></div>

    <v-container class="py-8 py-md-12 px-3 px-sm-6 position-relative" style="max-width: 1440px;">
      <!-- Search Input Header -->
      <header class="text-center mb-6 mb-md-8 mx-auto" style="max-width: 760px;">
        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          class="font-mono font-weight-bold text-uppercase mb-4"
          prepend-icon="mdi-magnify"
        >
          {{ $t('Search.Badge') }}
        </v-chip>

        <h1 class="text-h4 text-md-h3 font-weight-black text-white mb-4">
          <template v-if="cleanQuery">
            {{ $t('Search.TitleWithQuery', { query: cleanQuery }) }}
          </template>
          <template v-else>
            {{ $t('Search.TitleEmpty') }}
          </template>
        </h1>

        <!-- Search input box -->
        <v-text-field
          id="search-page-input"
          v-model="searchQuery"
          :placeholder="$t('Search.Placeholder')"
          prepend-inner-icon="mdi-magnify"
          clearable
          variant="solo"
          flat
          rounded="pill"
          density="comfortable"
          hide-details
          class="search-main-field mb-4"
          @keyup.enter="handleEnter"
        >
          <template #append-inner>
            <v-btn
              v-if="cleanQuery"
              :to="{ name: 'Explore', query: { q: cleanQuery } }"
              variant="text"
              size="small"
              class="text-none font-weight-bold mr-1 d-none d-sm-flex text-grey-lighten-1"
              prepend-icon="mdi-tune-variant"
            >
              {{ $t('Search.AdvancedFilters') }}
              <GlassTooltip icon="mdi-tune-variant" :text="$t('Search.AdvancedFiltersHint')" />
            </v-btn>
          </template>
        </v-text-field>

        <!-- Quick Trending Suggestions -->
        <div class="d-flex align-center justify-center flex-wrap ga-2">
          <span class="text-caption text-grey mr-1">{{ $t('Search.Trending') }}:</span>
          <v-chip
            v-for="tag in trendingTags"
            :key="tag"
            size="small"
            variant="tonal"
            class="cursor-pointer"
            @click="setQuery(tag)"
          >
            {{ tag }}
          </v-chip>
        </div>
      </header>

      <!-- Empty Query State (Initial Guide) -->
      <v-sheet
        v-if="!cleanQuery"
        rounded="xl"
        border
        color="#121018"
        class="pa-8 pa-md-12 text-center mx-auto my-6"
        style="max-width: 800px;"
      >
        <v-icon size="64" color="primary" class="mb-4">mdi-compass-outline</v-icon>
        <div class="text-h5 font-weight-bold text-white mb-2">{{ $t('Search.InitialPromptTitle') }}</div>
        <div class="text-body-2 text-grey-lighten-1 mx-auto mb-6" style="max-width: 520px;">
          {{ $t('Search.InitialPromptDesc') }}
        </div>
        <div class="d-flex justify-center ga-3 flex-wrap">
          <v-btn
            :to="{ name: 'Explore' }"
            color="primary"
            rounded="pill"
            class="text-none font-weight-bold px-6"
            prepend-icon="mdi-compass"
          >
            {{ $t('Search.BrowseExplore') }}
          </v-btn>
        </div>
      </v-sheet>

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
          <!-- ============ ALL (OVERVIEW) TAB ============ -->
          <v-window-item value="all">
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
                  @click="searchQuery = ''"
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
                    <h2 class="text-h6 font-weight-bold text-white mb-0">{{ $t('Search.Sections.TopTracks') }}</h2>
                    <v-chip size="x-small" variant="tonal" color="primary">{{ tracks.state.total }}</v-chip>
                  </div>
                  <v-btn
                    v-if="tracks.state.total > 4"
                    variant="text"
                    color="primary"
                    size="small"
                    class="text-none font-weight-bold"
                    append-icon="mdi-arrow-right"
                    @click="activeTab = 'tracks'"
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
                    <h2 class="text-h6 font-weight-bold text-white mb-0">{{ $t('Search.Sections.Producers') }}</h2>
                    <v-chip size="x-small" variant="tonal" color="primary">{{ producers.state.total }}</v-chip>
                  </div>
                  <v-btn
                    v-if="producers.state.total > 4"
                    variant="text"
                    color="primary"
                    size="small"
                    class="text-none font-weight-bold"
                    append-icon="mdi-arrow-right"
                    @click="activeTab = 'producers'"
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
                    <h2 class="text-h6 font-weight-bold text-white mb-0">{{ $t('Search.Sections.Soundkits') }}</h2>
                    <v-chip size="x-small" variant="tonal" color="primary">{{ soundkits.state.total }}</v-chip>
                  </div>
                  <v-btn
                    v-if="soundkits.state.total > 4"
                    variant="text"
                    color="primary"
                    size="small"
                    class="text-none font-weight-bold"
                    append-icon="mdi-arrow-right"
                    @click="activeTab = 'soundkits'"
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
          </v-window-item>

          <!-- ============ TRACKS TAB ============ -->
          <v-window-item value="tracks">
            <div class="d-flex flex-wrap align-center ga-3 mb-5">
              <div class="text-body-2 text-grey-lighten-1">
                <template v-if="tracks.state.loaded">
                  {{ $t('Explore.Tracks.Results', { count: tracks.state.total }) }}
                </template>
              </div>
              <v-spacer />
              <v-select
                id="search-track-sort"
                v-model="trackSort"
                :items="trackSortItems"
                :aria-label="$t('Explore.Sort.Label')"
                prepend-inner-icon="mdi-sort"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                style="max-width: 240px; min-width: 200px;"
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
              :page-size="PAGE_SIZE"
              @load="tracks.load(false)"
            />
          </v-window-item>

          <!-- ============ PRODUCERS TAB ============ -->
          <v-window-item value="producers">
            <div class="d-flex flex-wrap align-center ga-3 mb-5">
              <div class="text-body-2 text-grey-lighten-1">
                <template v-if="producers.state.loaded">
                  {{ $t('Explore.Producers.Results', { count: producers.state.total }) }}
                </template>
              </div>
              <v-spacer />
              <v-select
                id="search-producer-sort"
                v-model="producerSort"
                :items="producerSortItems"
                :aria-label="$t('Explore.Sort.Label')"
                prepend-inner-icon="mdi-sort"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                style="max-width: 240px; min-width: 200px;"
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
              :page-size="PAGE_SIZE"
              @load="producers.load(false)"
            />
          </v-window-item>

          <!-- ============ SOUNDKITS TAB ============ -->
          <v-window-item value="soundkits">
            <div class="d-flex flex-wrap align-center ga-3 mb-5">
              <div class="text-body-2 text-grey-lighten-1">
                <template v-if="soundkits.state.loaded">
                  {{ $t('Explore.Soundkits.Results', { count: soundkits.state.total }) }}
                </template>
              </div>
              <v-spacer />
              <v-select
                id="search-soundkit-sort"
                v-model="soundkitSort"
                :items="soundkitSortItems"
                :aria-label="$t('Explore.Sort.Label')"
                prepend-inner-icon="mdi-sort"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                style="max-width: 240px; min-width: 200px;"
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
              :page-size="PAGE_SIZE"
              @load="soundkits.load(false)"
            />
          </v-window-item>
        </v-window>
      </template>
    </v-container>
  </v-main>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import ProducerCard from '@/components/Explore/ProducerCard.vue'
import SoundkitCard from '@/components/Explore/SoundkitCard.vue'
import ExploreEmpty from '@/components/Explore/ExploreEmpty.vue'
import ExploreLoadMore from '@/components/Explore/ExploreLoadMore.vue'
import {
  fetchExploreProducers,
  fetchExploreSoundkits,
  fetchExploreTracks
} from '@/services/exploreApi'

const PAGE_SIZE = 24
const TABS = ['all', 'tracks', 'producers', 'soundkits']

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const searchQuery = ref((route.query.q || '').toString())
const cleanQuery = computed(() => (searchQuery.value || '').toString().trim())
const activeTab = ref(TABS.includes(route.query.tab) ? route.query.tab : 'all')
const trackSort = ref((route.query.sort || 'popular').toString())
const producerSort = ref((route.query.psort || 'popular').toString())
const soundkitSort = ref((route.query.ksort || 'popular').toString())

const trendingTags = ['Trap', 'Drill', 'Lo-Fi', 'Hip-Hop', 'Synthwave', 'Dark', 'R&B']

function setQuery(tag) {
  searchQuery.value = tag
  performSearch()
}

function handleEnter() {
  performSearch()
}

// ---------------------------------------------------------------------------
// Paged lists
// ---------------------------------------------------------------------------
function createPagedList(fetchPage) {
  const s = reactive({
    items: [],
    total: 0,
    page: 0,
    hasMore: false,
    loading: false,
    loadingMore: false,
    loaded: false,
    error: false
  })
  let controller = null

  async function load(reset = true) {
    if (!reset && (s.loading || s.loadingMore || !s.hasMore)) return
    controller?.abort()
    const current = (controller = new AbortController())
    const page = reset ? 1 : s.page + 1
    s.loading = reset
    s.loadingMore = !reset
    s.error = false

    try {
      const data = await fetchPage(page, current.signal)
      if (reset) {
        s.items = data.items
      } else {
        const seen = new Set(s.items.map((i) => String(i._id)))
        s.items = [...s.items, ...data.items.filter((i) => !seen.has(String(i._id)))]
      }
      s.total = data.total
      s.page = data.page
      s.hasMore = data.hasMore
      s.loaded = true
    } catch (e) {
      if (e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError') return
      s.error = true
    } finally {
      if (controller === current) {
        s.loading = false
        s.loadingMore = false
      }
    }
  }

  function resetState() {
    controller?.abort()
    s.items = []
    s.total = 0
    s.page = 0
    s.hasMore = false
    s.loading = false
    s.loadingMore = false
    s.loaded = false
    s.error = false
  }

  return { state: s, load, resetState, abort: () => controller?.abort() }
}

const tracks = createPagedList((page, signal) =>
  fetchExploreTracks({ q: cleanQuery.value, sort: trackSort.value, page, limit: PAGE_SIZE }, { signal })
)
const producers = createPagedList((page, signal) =>
  fetchExploreProducers({ q: cleanQuery.value, sort: producerSort.value, page, limit: PAGE_SIZE }, { signal })
)
const soundkits = createPagedList((page, signal) =>
  fetchExploreSoundkits({ q: cleanQuery.value, sort: soundkitSort.value, page, limit: PAGE_SIZE }, { signal })
)

const lists = [tracks, producers, soundkits]

const isInitialLoading = computed(() =>
  (tracks.state.loading && !tracks.state.loaded) ||
  (producers.state.loading && !producers.state.loaded) ||
  (soundkits.state.loading && !soundkits.state.loaded)
)

const allAreEmpty = computed(() =>
  tracks.state.loaded &&
  producers.state.loaded &&
  soundkits.state.loaded &&
  tracks.state.total === 0 &&
  producers.state.total === 0 &&
  soundkits.state.total === 0
)

const debounce = (fn, ms) => {
  let id
  const wrapped = (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), ms)
  }
  wrapped.cancel = () => clearTimeout(id)
  return wrapped
}

function performSearch() {
  const q = cleanQuery.value
  if (!q) {
    lists.forEach((l) => l.resetState())
    return
  }
  tracks.load(true)
  producers.load(true)
  soundkits.load(true)
}

const debouncedSearch = debounce(performSearch, 350)

// URL sync
const syncUrl = debounce(() => {
  const query = {}
  const q = cleanQuery.value
  if (q) query.q = q
  if (activeTab.value !== 'all') query.tab = activeTab.value
  if (trackSort.value !== 'popular') query.sort = trackSort.value
  if (producerSort.value !== 'popular') query.psort = producerSort.value
  if (soundkitSort.value !== 'popular') query.ksort = soundkitSort.value

  const currentQ = (route.query.q || '').toString()
  const currentTab = (route.query.tab || 'all').toString()
  if (currentQ !== (query.q || '') || currentTab !== (query.tab || 'all')) {
    router.replace({ query }).catch(() => {})
  }
}, 300)

watch([searchQuery, activeTab, trackSort, producerSort, soundkitSort], () => {
  syncUrl()
})

watch(searchQuery, () => {
  debouncedSearch()
})

watch(trackSort, () => {
  if (cleanQuery.value) tracks.load(true)
})
watch(producerSort, () => {
  if (cleanQuery.value) producers.load(true)
})
watch(soundkitSort, () => {
  if (cleanQuery.value) soundkits.load(true)
})

// React to external URL navigation (e.g. from TopNav or Hero)
watch(
  () => route.query.q,
  (newQ) => {
    const val = (newQ || '').toString()
    if (val !== searchQuery.value) {
      searchQuery.value = val
      performSearch()
    }
  }
)

if (cleanQuery.value) {
  performSearch()
}

onBeforeUnmount(() => {
  debouncedSearch.cancel()
  syncUrl.cancel()
  lists.forEach((l) => l.abort())
})

// ---------------------------------------------------------------------------
// Sort Options
// ---------------------------------------------------------------------------
const trackSortItems = computed(() => [
  { value: 'popular', title: t('Explore.Sort.MostStreamed') },
  { value: 'newest', title: t('Explore.Sort.Newest') },
  { value: 'liked', title: t('Explore.Sort.MostLiked') },
  { value: 'price_asc', title: t('Explore.Sort.PriceAsc') },
  { value: 'price_desc', title: t('Explore.Sort.PriceDesc') }
])

const producerSortItems = computed(() => [
  { value: 'popular', title: t('Explore.Sort.MostStreamed') },
  { value: 'newest', title: t('Explore.Sort.RecentlyActive') },
  { value: 'tracks', title: t('Explore.Sort.MostTracks') }
])

const soundkitSortItems = computed(() => [
  { value: 'popular', title: t('Explore.Sort.MostViewed') },
  { value: 'newest', title: t('Explore.Sort.Newest') },
  { value: 'price_asc', title: t('Explore.Sort.PriceAsc') },
  { value: 'price_desc', title: t('Explore.Sort.PriceDesc') }
])
</script>

<style scoped>
.search-page {
  position: relative;
  overflow: hidden;
  min-height: 80vh;
}
.search-glow {
  position: absolute;
  top: -180px;
  left: 50%;
  width: 900px;
  height: 480px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at center, rgba(var(--v-theme-primary), 0.22), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}
.search-main-field :deep(.v-field) {
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
  transition: box-shadow 0.25s ease;
}
.search-main-field :deep(.v-field--focused) {
  box-shadow: 0 12px 40px -8px rgba(var(--v-theme-primary), 0.35), 0 0 0 1.5px rgba(var(--v-theme-primary), 0.8) !important;
}
</style>
