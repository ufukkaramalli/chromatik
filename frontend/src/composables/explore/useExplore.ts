import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCurrencyStore } from '@/stores/currencyStore'
import {
  fetchExploreFacets,
  fetchExploreProducers,
  fetchExploreSoundkits,
  fetchExploreTracks
} from '@/services/exploreApi'
import { useSeo } from '@/composables/useSeo'

export interface PagedListState {
  items: any[]
  total: number
  page: number
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  loaded: boolean
  error: boolean
}

export interface PagedList {
  state: PagedListState
  load: (reset?: boolean) => Promise<void>
  abort: () => void
}

export interface ExploreFiltersState {
  q?: string
  genres: string[]
  moods: string[]
  key?: string
  bpm: [number, number] | null
  price: [number, number] | null
}

export interface ExploreState {
  tab: 'tracks' | 'producers' | 'soundkits'
  filters: ExploreFiltersState
  sort: string
  psort: string
  ksort: string
}

export interface ActiveFilterChip {
  id: string
  icon: string
  label: string
  clear: () => void
}

const APP_NAME = import.meta.env.VITE_APPLICATION_NAME || 'CHROMATIK'
export const PAGE_SIZE = 24
export const TABS = ['tracks', 'producers', 'soundkits'] as const
export const TRACK_SORTS = ['newest', 'popular', 'liked', 'price_asc', 'price_desc'] as const
export const PRODUCER_SORTS = ['popular', 'newest', 'tracks'] as const
export const SOUNDKIT_SORTS = ['newest', 'popular', 'price_asc', 'price_desc'] as const
export const DEFAULT_BPM: [number, number] = [60, 200]
export const DEFAULT_PRICE_MAX = 100

export function useExplore() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const currencyStore = useCurrencyStore()

  const filterSheet = ref(false)

  // URL <-> state helpers
  const parseList = (v: any) =>
    (Array.isArray(v) ? v.join(',') : typeof v === 'string' ? v : '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)

  const parseRange = (v: any): [number, number] | null => {
    const m = typeof v === 'string' ? v.match(/^(\d+)-(\d+)$/) : null
    if (!m) return null
    const range: [number, number] = [Number(m[1]), Number(m[2])]
    return range[0] <= range[1] ? range : null
  }

  const pick = <T extends string>(v: any, allowed: readonly T[], fallback: T): T =>
    allowed.includes(v) ? (v as T) : fallback

  const text = (v: any) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

  function readRoute(r: any): ExploreState {
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

  function buildQuery(s: ExploreState) {
    const f = s.filters
    const q: Record<string, string> = {}
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

  const state = reactive<ExploreState>(readRoute(route))

  const debounce = (fn: (...args: any[]) => void, ms: number) => {
    let id: any
    const wrapped = (...args: any[]) => {
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

  // SEO Metadata
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

  // Paged lists
  function createPagedList(
    fetchPage: (page: number, signal: AbortSignal) => Promise<{ items: any[]; total: number; page: number; hasMore: boolean }>
  ): PagedList {
    const s = reactive<PagedListState>({
      items: [],
      total: 0,
      page: 0,
      hasMore: false,
      loading: false,
      loadingMore: false,
      loaded: false,
      error: false
    })
    let controller: AbortController | null = null

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
          const seen = new Set(s.items.map((i: any) => String(i._id)))
          s.items = [...s.items, ...data.items.filter((i: any) => !seen.has(String(i._id)))]
        }
        s.total = data.total
        s.page = data.page
        s.hasMore = data.hasMore
        s.loaded = true
      } catch (e: any) {
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
  const lists: Record<string, PagedList> = { tracks, producers, soundkits }
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

  // Facets
  const facets = ref<any>(null)
  const facetsLoading = ref(true)

  const canonicalize = (selected: string[], options: any[] = []) =>
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

  const bpmBounds = computed<[number, number]>(() => {
    const { min, max } = facets.value?.bpm || {}
    if (typeof min !== 'number' || typeof max !== 'number') return DEFAULT_BPM
    return [Math.floor(min), Math.ceil(max)]
  })

  const priceBounds = computed<[number, number]>(() => {
    const max = facets.value?.price?.max
    return [0, typeof max === 'number' && max > 0 ? Math.ceil(max) : DEFAULT_PRICE_MAX]
  })

  // Active filter chips
  const patchFilters = (changes: Partial<ExploreFiltersState>) => {
    state.filters = { ...state.filters, ...changes }
  }

  const activeFilters = computed<ActiveFilterChip[]>(() => {
    const f = state.filters
    const chips: ActiveFilterChip[] = []
    if (f.q) chips.push({ id: 'q', icon: 'mdi-magnify', label: `“${f.q}”`, clear: () => patchFilters({ q: undefined }) })
    f.genres.forEach((g) =>
      chips.push({ id: `g-${g}`, icon: 'mdi-music-box-outline', label: g, clear: () => patchFilters({ genres: f.genres.filter((x) => x !== g) }) })
    )
    f.moods.forEach((m) =>
      chips.push({ id: `m-${m}`, icon: 'mdi-emoticon-outline', label: m, clear: () => patchFilters({ moods: f.moods.filter((x) => x !== m) }) })
    )
    if (f.key) chips.push({ id: 'key', icon: 'mdi-music-clef-treble', label: `${t('Explore.Filters.Key')}: ${f.key}`, clear: () => patchFilters({ key: undefined }) })
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
    state.filters = { q: undefined, genres: [], moods: [], key: undefined, bpm: null, price: null }
  }

  // Static option lists
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

  return {
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
    patchFilters,
    pageSize: PAGE_SIZE
  }
}
