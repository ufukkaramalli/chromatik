import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { formatCompactNumber } from '@/utils/format'
import type { TrackLike } from '@/types/audio'

export interface GenreItem {
  name: string
  color: string
  icon: string
  spec: string
  sound: string
}

export const GENRE_ITEMS: GenreItem[] = [
  {
    name: 'Trap',
    color: '#D500F9',
    icon: 'mdi-fire',
    spec: '135-165 BPM',
    sound: '808s & Heavy Beats'
  },
  {
    name: 'Lo-Fi',
    color: '#FF9100',
    icon: 'mdi-coffee',
    spec: '70-90 BPM',
    sound: 'Chill & Vintage Soul'
  },
  {
    name: 'Synthwave',
    color: '#FF1744',
    icon: 'mdi-cassette',
    spec: '105-130 BPM',
    sound: '80s Retro Neon Synth'
  },
  {
    name: 'Hip-Hop',
    color: '#FFD600',
    icon: 'mdi-microphone-variant',
    spec: '85-105 BPM',
    sound: 'Boom Bap & Drill Flow'
  },
  {
    name: 'Electronic',
    color: '#00E676',
    icon: 'mdi-flash',
    spec: '124-132 BPM',
    sound: 'Club Pulse & Bassline'
  },
  {
    name: 'Cyberpunk',
    color: '#00E5FF',
    icon: 'mdi-laser-pointer',
    spec: '100-140 BPM',
    sound: 'Dark Industrial Groove'
  },
  {
    name: 'Ambient',
    color: '#7C4DFF',
    icon: 'mdi-weather-night',
    spec: '60-80 BPM',
    sound: 'Space Textures & Drone'
  }
]

export const STUDIO_WAVEFORM_BARS = [
  35, 45, 60, 80, 50, 40, 70, 95, 85, 60, 45, 30, 55, 75, 90, 100, 80, 65, 40, 50,
  70, 85, 60, 45, 65, 85, 95, 70, 50, 40, 60, 80, 90, 75, 55, 40, 50, 70, 85, 65,
  45, 35
]

export function useHomeDiscovery() {
  const router = useRouter()
  const app = useAppStore()
  const auth = useAuthStore()
  const { t } = useI18n()

  const {
    GET_RECENT_TRACKS: GetRecentTracks,
    GET_MOST_LIKED_TRACKS: GetMostLikedTracks,
    GET_MOST_STREAMED_TRACKS: GetMostStreamedTracks,
    GET_STATS: GetPlatformStats
  } = storeToRefs(app)

  const searchQuery = ref('')

  const producerMetricsCount = computed(() => {
    const count = GetPlatformStats.value?.producersCount ?? 0
    return formatCompactNumber(count)
  })

  const trackMetricsCount = computed(() => {
    const count = GetPlatformStats.value?.tracksCount ?? 0
    return formatCompactNumber(count)
  })

  const marqueeItems = computed(() => [
    { text: t('Home.Landing.Marquee.Item1'), primary: true },
    { text: t('Home.Landing.Marquee.Item2'), primary: false },
    { text: t('Home.Landing.Marquee.Item3'), primary: true },
    { text: t('Home.Landing.Marquee.Item4'), primary: false },
    { text: t('Home.Landing.Marquee.Item5'), primary: true },
    { text: t('Home.Landing.Marquee.Item6'), primary: false }
  ])

  function matchesFilter(track: any) {
    if (!track) return false
    if (searchQuery.value && searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const inName = track.name?.toLowerCase().includes(q)
      const inUser = track.user?.name?.toLowerCase().includes(q)
      const inGenre = track.genres?.some((g: any) => typeof g === 'string' && g.toLowerCase().includes(q))
      const inMood = track.moods?.some((m: any) => typeof m === 'string' && m.toLowerCase().includes(q))
      const inTag = track.tags?.some((t: any) => typeof t === 'string' && t.toLowerCase().includes(q))
      const inKey = track.key?.toLowerCase().includes(q)
      const inBpm = String(track.bpm || '').includes(q)
      return inName || inUser || inGenre || inMood || inTag || inKey || inBpm
    }
    return true
  }

  const filteredRecentTracks = computed(() => {
    if (!GetRecentTracks.value) return null
    return GetRecentTracks.value.filter(matchesFilter)
  })

  const recentTracksCountText = computed(() => {
    const count = filteredRecentTracks.value?.length ?? 0
    return t('Home.Landing.Recent.LiveCount', { count })
  })

  const filteredMostLikedTracks = computed(() => {
    if (!GetMostLikedTracks.value) return null
    return GetMostLikedTracks.value.filter(matchesFilter)
  })

  const filteredMostStreamedTracks = computed(() => {
    if (!GetMostStreamedTracks.value) return null
    return GetMostStreamedTracks.value.filter(matchesFilter)
  })

  // Candidate pool gathered from available loaded tracks
  const candidatePool = computed(() => {
    const map = new Map<string, any>()

    const addTracks = (list: any) => {
      if (!Array.isArray(list)) return
      for (const track of list) {
        if (!track) continue
        const id = String(track._id || track.id || '')
        if (!id) continue
        if (!map.has(id)) {
          // Eligibility check: must have cover art and playable audio
          const hasArt = !!track.art
          const hasAudio = !!(track.url || track.taggedAudioUrl || track.untaggedAudioUrl)
          if (hasArt && hasAudio) {
            map.set(id, track)
          }
        }
      }
    }

    addTracks(GetMostStreamedTracks.value)
    addTracks(GetMostLikedTracks.value)
    addTracks(GetRecentTracks.value)

    const tracks = Array.from(map.values())
    if (!tracks.length) return []

    // Rank candidate tracks by quality / engagement score
    return tracks.sort((a, b) => {
      const scoreA = (a.likes || 0) * 3 + (a.views || 0) + (a.bpm && a.key ? 10 : 0) + (a.genres?.length ? 5 : 0)
      const scoreB = (b.likes || 0) * 3 + (b.views || 0) + (b.bpm && b.key ? 10 : 0) + (b.genres?.length ? 5 : 0)
      return scoreB - scoreA
    })
  })

  // Track of the Day: Deterministic daily rotation from the elite candidates pool
  const featuredTrack = computed<TrackLike | null>(() => {
    const pool = candidatePool.value
    if (!pool.length) {
      return (GetMostStreamedTracks.value?.[0] || GetMostLikedTracks.value?.[0] || GetRecentTracks.value?.[0] || null) as TrackLike | null
    }

    const now = new Date()
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))

    // Rotate deterministically among top 10 candidates
    const topCandidates = pool.slice(0, 10)
    const index = dayOfYear % topCandidates.length
    return topCandidates[index] as TrackLike
  })

  function handleVibeClick(vibe: string) {
    router.push({ name: 'Explore', params: { tab: 'tracks' }, query: { genre: vibe } }).catch(() => {})
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleHeroSearch() {
    const q = searchQuery.value?.trim()
    router.push({ name: 'Search', query: q ? { q } : {} }).catch(() => {})
  }

  function handleUploadClick() {
    if (auth.authenticated) {
      router.push({ name: 'Dashboard' }).catch(() => {})
    } else {
      app.setLoginOverlay(true)
    }
  }

  function handleSoundkitsClick() {
    if (auth.authenticated) {
      router.push({ name: 'Soundkits' }).catch(() => {})
    } else {
      app.setLoginOverlay(true)
    }
  }

  function fetchHomeData() {
    app.FETCH_STATS()
    app.RECENT_TRACKS()
    app.MOST_LIKED()
    app.MOST_STREAMED()
  }

  return {
    searchQuery,
    producerMetricsCount,
    trackMetricsCount,
    marqueeItems,
    genreItems: GENRE_ITEMS,
    studioWaveformBars: STUDIO_WAVEFORM_BARS,
    featuredTrack,
    filteredRecentTracks,
    recentTracksCountText,
    filteredMostLikedTracks,
    filteredMostStreamedTracks,
    isStreamedLoading: computed(() => GetMostStreamedTracks.value === null),
    isLikedLoading: computed(() => GetMostLikedTracks.value === null),
    isRecentLoading: computed(() => GetRecentTracks.value === null),
    handleVibeClick,
    scrollToSection,
    handleHeroSearch,
    handleUploadClick,
    handleSoundkitsClick,
    fetchHomeData
  }
}
