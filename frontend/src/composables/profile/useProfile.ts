import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api, isConnectionError } from '@/lib/axios'
import { getTrackId } from '@/utils/track'
import { useSeo } from '@/composables/useSeo'
import type { TrackLike } from '@/types/audio'

export interface UserSocialLinks {
  instagram?: string
  twitter?: string
  youtube?: string
  soundcloud?: string
}

export interface UserProfile {
  _id: string
  name: string
  slug: string
  bio?: string
  photoUrl?: string
  location?: string
  createdAt?: string
  profileTheme?: string
  socialLinks?: UserSocialLinks
  followersCount?: number
  followers?: any[]
  tracks?: any[]
  soundkits?: any[]
}

const APP_NAME = import.meta.env.VITE_APPLICATION_NAME || 'CHROMATIK'

export function useProfile() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const loading = ref(true)
  const profile = ref<UserProfile | null>(null)
  const activeTab = ref<'tracks' | 'soundkits'>(
    route.query.tab === 'soundkits' ? 'soundkits' : 'tracks'
  )

  watch(activeTab, (tab) => {
    const currentTab = route.query.tab
    const targetTab = tab === 'soundkits' ? 'soundkits' : undefined
    if (currentTab !== targetTab) {
      const nextQuery = { ...route.query }
      if (targetTab) nextQuery.tab = targetTab
      else delete nextQuery.tab
      router.replace({ query: nextQuery }).catch(() => {})
    }
  })

  // SEO & Social Media Metadata
  const seoTitle = computed(() => {
    if (!profile.value?.name) return `Profile | ${APP_NAME}`
    return `${profile.value.name} (@${profile.value.slug || route.params.userSlug}) | ${APP_NAME}`
  })

  const seoDescription = computed(() => {
    if (!profile.value) return 'Discover artist profile, beats, and soundkits on Chromatik.'
    if (profile.value.bio) return profile.value.bio
    return `Listen to tracks, beats, and soundkits by ${profile.value.name} on Chromatik.`
  })

  const seoImage = computed(() => {
    return profile.value?.photoUrl || ''
  })

  const canonicalUrl = computed(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const slug = profile.value?.slug || route.params.userSlug || ''
    return `${origin}/${slug}`
  })

  useSeo({
    title: seoTitle,
    description: seoDescription,
    canonical: canonicalUrl,
    image: seoImage,
    type: ref('profile')
  })

  const formattedTracks = computed<TrackLike[]>(() => {
    if (!profile.value?.tracks) return []
    return profile.value.tracks.map((track) => ({
      ...track,
      id: getTrackId(track),
      user: track.user || {
        _id: profile.value?._id,
        name: profile.value?.name,
        slug: profile.value?.slug
      }
    }))
  })

  const formatStatNumber = (num: any) => {
    if (num == null || isNaN(num)) return '0'
    const val = Number(num)
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (val >= 10000) {
      return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return new Intl.NumberFormat().format(val)
  }

  const formattedFollowers = computed(() => {
    const count = profile.value?.followersCount ?? profile.value?.followers?.length ?? 0
    return formatStatNumber(count)
  })

  const formattedTotalPlays = computed(() => {
    if (!profile.value?.tracks?.length) return '0'
    const total = profile.value.tracks.reduce((sum, track) => sum + (Number(track.views) || 0), 0)
    return formatStatNumber(total)
  })

  const formattedTotalReleases = computed(() => {
    const tracksCount = profile.value?.tracks?.length || 0
    const soundkitsCount = profile.value?.soundkits?.length || 0
    return formatStatNumber(tracksCount + soundkitsCount)
  })

  const fetchProfile = async () => {
    loading.value = true
    try {
      const slug = route.params.userSlug
      const response = await api.get(`/user/profile/${slug}`)
      if (response.data.profile) {
        profile.value = response.data.profile
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      if (isConnectionError(error)) return
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchProfile()
  })

  return {
    loading,
    profile,
    activeTab,
    formattedTracks,
    formattedFollowers,
    formattedTotalPlays,
    formattedTotalReleases,
    fetchProfile
  }
}
