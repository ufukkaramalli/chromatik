import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
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
  resetState: () => void
  abort: () => void
}

const APP_NAME = import.meta.env.VITE_APPLICATION_NAME || 'CHROMATIK'
export const PAGE_SIZE = 24
export const SEARCH_TABS = ['all', 'tracks', 'producers', 'soundkits'] as const
export type SearchTab = typeof SEARCH_TABS[number]

export const TRENDING_TAGS = ['Trap', 'Drill', 'Lo-Fi', 'Hip-Hop', 'Synthwave', 'Dark', 'R&B']

export function useSearch() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const searchQuery = ref((route.query.q || '').toString())
  const cleanQuery = computed(() => (searchQuery.value || '').toString().trim())
  const activeTab = ref<SearchTab>(
    SEARCH_TABS.includes(route.query.tab as SearchTab) ? (route.query.tab as SearchTab) : 'all'
  )
  const trackSort = ref((route.query.sort || 'popular').toString())
  const producerSort = ref((route.query.psort || 'popular').toString())
  const soundkitSort = ref((route.query.ksort || 'popular').toString())

  // SEO Metadata
  const seoTitle = computed(() => {
    return cleanQuery.value
      ? `“${cleanQuery.value}” - Search | ${APP_NAME}`
      : `Search | ${APP_NAME}`
  })

  const seoDescription = computed(() => {
    return cleanQuery.value
      ? `Search results for "${cleanQuery.value}" on Chromatik. Find matching tracks, producers, and soundkits.`
      : 'Search across tracks, beats, producers, and soundkits on Chromatik.'
  })

  useSeo({
    title: seoTitle,
    description: seoDescription,
    robots: ref('noindex, follow')
  })

  function setQuery(tag: string) {
    searchQuery.value = tag
    performSearch()
  }

  function handleEnter() {
    performSearch()
  }

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

  const debounce = (fn: (...args: any[]) => void, ms: number) => {
    let id: any
    const wrapped = (...args: any[]) => {
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
    const query: Record<string, string> = {}
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

  // Sort Options
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

  return {
    searchQuery,
    cleanQuery,
    activeTab,
    trackSort,
    producerSort,
    soundkitSort,
    trendingTags: TRENDING_TAGS,
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
    performSearch,
    pageSize: PAGE_SIZE
  }
}
