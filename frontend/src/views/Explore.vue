<template>
  <v-main class="bg-black explore-page">
    <!-- Ambient glow (decorative) -->
    <div class="explore-glow" aria-hidden="true"></div>

    <v-container class="py-10 py-md-14 px-3 px-sm-6 position-relative" style="max-width: 1440px;">
      <!-- Hero -->
      <header class="text-center mb-8 mb-md-10">
        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          class="font-mono font-weight-bold text-uppercase mb-4"
          prepend-icon="mdi-compass-outline"
        >
          {{ $t('Explore.Badge') }}
        </v-chip>
        <h1 class="text-h4 text-md-h3 font-weight-black text-white mb-3">
          {{ $t('Explore.Title') }}
        </h1>
        <p class="text-body-1 text-grey-lighten-1 mx-auto mb-0" style="max-width: 680px;">
          {{ $t('Explore.Subtitle') }}
        </p>
      </header>

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
        <!-- ============ TRACKS ============ -->
        <v-window-item value="tracks">
          <v-row>
            <!-- Desktop filter sidebar -->
            <v-col v-if="mdAndUp" cols="12" md="4" lg="3">
              <v-card
                rounded="xl"
                border
                color="#121018"
                elevation="0"
                class="pa-5 explore-sidebar"
              >
                <ExploreFilters
                  v-model="state.filters"
                  :facets="facets"
                  :loading="facetsLoading"
                  :bpm-bounds="bpmBounds"
                  :price-bounds="priceBounds"
                  :has-active="activeFilters.length > 0"
                  @reset="resetFilters"
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
                  @click="filterSheet = true"
                >
                  {{ $t('Explore.Filters.Open') }}
                  <v-badge
                    v-if="activeFilters.length"
                    :content="activeFilters.length"
                    color="primary"
                    inline
                  />
                </v-btn>

                <div class="text-body-2 text-grey-lighten-1">
                  <template v-if="tracks.state.loaded">
                    {{ $t('Explore.Tracks.Results', { count: tracks.state.total }) }}
                  </template>
                </div>

                <v-spacer />

                <v-select
                  id="explore-track-sort"
                  v-model="state.sort"
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
                  @click="resetFilters"
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
                  @click="resetFilters"
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
                :page-size="PAGE_SIZE"
                @load="tracks.load(false)"
              />
            </v-col>
          </v-row>
        </v-window-item>

        <!-- ============ PRODUCERS ============ -->
        <v-window-item value="producers">
          <div class="d-flex flex-wrap align-center ga-3 mb-5">
            <div class="text-body-2 text-grey-lighten-1">
              <template v-if="producers.state.loaded">
                {{ $t('Explore.Producers.Results', { count: producers.state.total }) }}
              </template>
            </div>
            <v-spacer />
            <v-select
              id="explore-producer-sort"
              v-model="state.psort"
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
            id="explore-producers-more"
            :shown="producers.state.items.length"
            :total="producers.state.total"
            :has-more="producers.state.hasMore"
            :loading="producers.state.loadingMore"
            :page-size="PAGE_SIZE"
            @load="producers.load(false)"
          />
        </v-window-item>

        <!-- ============ SOUNDKITS ============ -->
        <v-window-item value="soundkits">
          <div class="d-flex flex-wrap align-center ga-3 mb-5">
            <div class="text-body-2 text-grey-lighten-1">
              <template v-if="soundkits.state.loaded">
                {{ $t('Explore.Soundkits.Results', { count: soundkits.state.total }) }}
              </template>
            </div>
            <v-spacer />
            <v-select
              id="explore-soundkit-sort"
              v-model="state.ksort"
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
            id="explore-soundkits-more"
            :shown="soundkits.state.items.length"
            :total="soundkits.state.total"
            :has-more="soundkits.state.hasMore"
            :loading="soundkits.state.loadingMore"
            :page-size="PAGE_SIZE"
            @load="soundkits.load(false)"
          />
        </v-window-item>
      </v-window>
    </v-container>

    <!-- Mobile filters -->
    <v-bottom-sheet v-model="filterSheet" scrollable>
      <v-card rounded="t-xl" color="#121018">
        <v-card-text class="pa-5">
          <ExploreFilters
            v-model="state.filters"
            :facets="facets"
            :loading="facetsLoading"
            :bpm-bounds="bpmBounds"
            :price-bounds="priceBounds"
            :has-active="activeFilters.length > 0"
            @reset="resetFilters"
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
            :loading="tracks.state.loading"
            @click="filterSheet = false"
          >
            {{ $t('Explore.Filters.ShowResults', { count: tracks.state.total }) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </v-main>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import ExploreFilters from '@/components/Explore/ExploreFilters.vue'
import ExploreEmpty from '@/components/Explore/ExploreEmpty.vue'
import ExploreLoadMore from '@/components/Explore/ExploreLoadMore.vue'
import ProducerCard from '@/components/Explore/ProducerCard.vue'
import SoundkitCard from '@/components/Explore/SoundkitCard.vue'
import { useCurrencyStore } from '@/stores/currencyStore'
import {
  fetchExploreFacets,
  fetchExploreProducers,
  fetchExploreSoundkits,
  fetchExploreTracks
} from '@/services/exploreApi'
import { useSeo } from '@/composables/useSeo'

const APP_NAME = import.meta.env.VITE_APPLICATION_NAME || 'CHROMATIK'
const PAGE_SIZE = 24
const TABS = ['tracks', 'producers', 'soundkits']
const TRACK_SORTS = ['newest', 'popular', 'liked', 'price_asc', 'price_desc']
const PRODUCER_SORTS = ['popular', 'newest', 'tracks']
const SOUNDKIT_SORTS = ['newest', 'popular', 'price_asc', 'price_desc']
const DEFAULT_BPM = [60, 200]
const DEFAULT_PRICE_MAX = 100

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { mdAndUp } = useDisplay()
const currencyStore = useCurrencyStore()

const filterSheet = ref(false)

// ---------------------------------------------------------------------------
// URL <-> state
// ---------------------------------------------------------------------------
const parseList = (v) =>
  (Array.isArray(v) ? v.join(',') : typeof v === 'string' ? v : '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const parseRange = (v) => {
  const m = typeof v === 'string' ? v.match(/^(\d+)-(\d+)$/) : null
  if (!m) return null
  const range = [Number(m[1]), Number(m[2])]
  return range[0] <= range[1] ? range : null
}

const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback)
const text = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null)

function readRoute(r) {
  const q = r.query || {}
  const tabParam = r.params?.tab
  return {
    tab: pick(tabParam || q.tab, TABS, 'tracks'),
    filters: {
      q: text(q.q),
      genres: parseList(q.genre),
      moods: parseList(q.mood),
      key: text(q.key),
      bpm: parseRange(q.bpm),
      price: parseRange(q.price)
    },
    sort: pick(q.sort, TRACK_SORTS, 'newest'),
    psort: pick(q.psort, PRODUCER_SORTS, 'popular'),
    ksort: pick(q.ksort, SOUNDKIT_SORTS, 'newest')
  }
}

function buildQuery(s) {
  const f = s.filters
  const q = {}
  if (f.q) q.q = f.q
  if (f.genres.length) q.genre = f.genres.join(',')
  if (f.moods.length) q.mood = f.moods.join(',')
  if (f.key) q.key = f.key
  if (f.bpm) q.bpm = f.bpm.join('-')
  if (f.price) q.price = f.price.join('-')
  if (s.sort !== 'newest') q.sort = s.sort
  if (s.psort !== 'popular') q.psort = s.psort
  if (s.ksort !== 'newest') q.ksort = s.ksort
  return q
}

const state = reactive(readRoute(route))

const debounce = (fn, ms) => {
  let id
  const wrapped = (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), ms)
  }
  wrapped.cancel = () => clearTimeout(id)
  return wrapped
}

const serializedState = computed(() => JSON.stringify(buildQuery(state)))

const syncUrl = debounce(() => {
  const currentTab = route.params.tab || 'tracks'
  const currentQueryStr = JSON.stringify(buildQuery(readRoute(route)))
  const nextQuery = buildQuery(state)
  const nextQueryStr = JSON.stringify(nextQuery)

  if (currentTab === state.tab && currentQueryStr === nextQueryStr) return

  router.replace({
    name: 'Explore',
    params: { tab: state.tab },
    query: nextQuery
  }).catch(() => {})
}, 300)

watch(serializedState, syncUrl)

// Back / forward navigation or external links while on this page
watch(
  () => [route.params.tab, route.query],
  () => {
    if (route.name !== 'Explore') return
    const next = readRoute(route)
    if (state.tab !== next.tab) {
      state.tab = next.tab
    }
    if (JSON.stringify(buildQuery(next)) !== serializedState.value) {
      Object.assign(state.filters, next.filters)
      state.sort = next.sort
      state.psort = next.psort
      state.ksort = next.ksort
    }
  }
)

// ---------------------------------------------------------------------------
// SEO Metadata
// ---------------------------------------------------------------------------
const seoTitle = computed(() => {
  const genrePrefix = state.filters.genres.length ? `${state.filters.genres.join(', ')} ` : ''
  if (state.tab === 'producers') {
    return `${t('Explore.Tabs.Producers')} | Explore | ${APP_NAME}`
  }
  if (state.tab === 'soundkits') {
    return `${t('Explore.Tabs.Soundkits')} | Explore | ${APP_NAME}`
  }
  if (genrePrefix) {
    return `${genrePrefix}Tracks & Beats | Explore | ${APP_NAME}`
  }
  return `${t('Explore.Tabs.Tracks')} | Explore | ${APP_NAME}`
})

const seoDescription = computed(() => {
  if (state.tab === 'producers') {
    return 'Discover and connect with top music producers, beatmakers, and sound designers on Chromatik.'
  }
  if (state.tab === 'soundkits') {
    return 'Browse royalty-free soundkits, sample packs, drum kits, and presets on Chromatik.'
  }
  const genres = state.filters.genres.join(', ')
  if (genres) {
    return `Explore top ${genres} beats and tracks. Stream, license, and download royalty-free music on Chromatik.`
  }
  return 'Explore tracks, beats, producers, and soundkits. Discover new sounds and independent music creators on Chromatik.'
})

const canonicalUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/explore/${state.tab}`
})

useSeo({
  title: seoTitle,
  description: seoDescription,
  canonical: canonicalUrl
})

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

  return { state: s, load, abort: () => controller?.abort() }
}

const tracks = createPagedList((page, signal) =>
  fetchExploreTracks({ ...state.filters, sort: state.sort, page, limit: PAGE_SIZE }, { signal })
)
const producers = createPagedList((page, signal) =>
  fetchExploreProducers({ sort: state.psort, page, limit: PAGE_SIZE }, { signal })
)
const soundkits = createPagedList((page, signal) =>
  fetchExploreSoundkits({ sort: state.ksort, page, limit: PAGE_SIZE }, { signal })
)

const trackKey = computed(() => JSON.stringify({ f: state.filters, s: state.sort }))
const reloadTracks = debounce(() => tracks.load(true), 350)
watch(trackKey, reloadTracks)
watch(() => state.psort, () => producers.load(true))
watch(() => state.ksort, () => soundkits.load(true))

// Lazy-load each tab the first time it is opened
const lists = { tracks, producers, soundkits }
watch(
  () => state.tab,
  (tab) => {
    const list = lists[tab]
    if (list && !list.state.loaded && !list.state.loading) list.load(true)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  syncUrl.cancel()
  reloadTracks.cancel()
  Object.values(lists).forEach((l) => l.abort())
})

// ---------------------------------------------------------------------------
// Facets
// ---------------------------------------------------------------------------
const facets = ref(null)
const facetsLoading = ref(true)

/** Align casing of URL values with stored tags so chips show as selected ("trap" vs "Trap"). */
const canonicalize = (selected, options = []) =>
  selected.map((s) => options.find((o) => o.name.toLowerCase() === s.toLowerCase())?.name || s)

fetchExploreFacets()
  .then((data) => {
    facets.value = data
    const genres = canonicalize(state.filters.genres, data.genres)
    const moods = canonicalize(state.filters.moods, data.moods)
    if (JSON.stringify(genres) !== JSON.stringify(state.filters.genres) ||
        JSON.stringify(moods) !== JSON.stringify(state.filters.moods)) {
      state.filters = { ...state.filters, genres, moods }
    }
  })
  .catch(() => { facets.value = null })
  .finally(() => { facetsLoading.value = false })

const bpmBounds = computed(() => {
  const { min, max } = facets.value?.bpm || {}
  if (typeof min !== 'number' || typeof max !== 'number') return DEFAULT_BPM
  return [Math.floor(min), Math.ceil(max)]
})

const priceBounds = computed(() => {
  const max = facets.value?.price?.max
  return [0, typeof max === 'number' && max > 0 ? Math.ceil(max) : DEFAULT_PRICE_MAX]
})

// ---------------------------------------------------------------------------
// Active filter chips
// ---------------------------------------------------------------------------
const patchFilters = (changes) => { state.filters = { ...state.filters, ...changes } }

const activeFilters = computed(() => {
  const f = state.filters
  const chips = []
  if (f.q) chips.push({ id: 'q', icon: 'mdi-magnify', label: `“${f.q}”`, clear: () => patchFilters({ q: null }) })
  f.genres.forEach((g) =>
    chips.push({ id: `g-${g}`, icon: 'mdi-music-box-outline', label: g, clear: () => patchFilters({ genres: f.genres.filter((x) => x !== g) }) })
  )
  f.moods.forEach((m) =>
    chips.push({ id: `m-${m}`, icon: 'mdi-emoticon-outline', label: m, clear: () => patchFilters({ moods: f.moods.filter((x) => x !== m) }) })
  )
  if (f.key) chips.push({ id: 'key', icon: 'mdi-music-clef-treble', label: `${t('Explore.Filters.Key')}: ${f.key}`, clear: () => patchFilters({ key: null }) })
  if (f.bpm) chips.push({ id: 'bpm', icon: 'mdi-metronome', label: `${f.bpm[0]}–${f.bpm[1]} BPM`, clear: () => patchFilters({ bpm: null }) })
  if (f.price) {
    chips.push({
      id: 'price',
      icon: 'mdi-tag-outline',
      label: `${currencyStore.formatPrice(f.price[0])} – ${currencyStore.formatPrice(f.price[1])}`,
      clear: () => patchFilters({ price: null })
    })
  }
  return chips
})

function resetFilters() {
  state.filters = { q: null, genres: [], moods: [], key: null, bpm: null, price: null }
}

// ---------------------------------------------------------------------------
// Static option lists
// ---------------------------------------------------------------------------
const tabs = computed(() => [
  { value: 'tracks', icon: 'mdi-music-note-outline', label: t('Explore.Tabs.Tracks') },
  { value: 'producers', icon: 'mdi-account-music-outline', label: t('Explore.Tabs.Producers') },
  { value: 'soundkits', icon: 'mdi-folder-music-outline', label: t('Explore.Tabs.Soundkits') }
])

const trackSortItems = computed(() => [
  { value: 'newest', title: t('Explore.Sort.Newest') },
  { value: 'popular', title: t('Explore.Sort.MostStreamed') },
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
  { value: 'newest', title: t('Explore.Sort.Newest') },
  { value: 'popular', title: t('Explore.Sort.MostViewed') },
  { value: 'price_asc', title: t('Explore.Sort.PriceAsc') },
  { value: 'price_desc', title: t('Explore.Sort.PriceDesc') }
])
</script>

<style scoped>
.explore-page {
  position: relative;
  overflow: hidden;
}
.explore-glow {
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
.explore-sidebar {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}
</style>
