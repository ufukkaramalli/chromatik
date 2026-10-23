import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { usePlayer } from '@/composables/usePlayer'
import { useTrackLike } from '@/composables/useTrackLike'
import { useAppTheme } from '@/composables/useAppTheme'
import { useSeo } from '@/composables/useSeo'
import { getThemePalette } from '@/utils/themePalette'
import { getTrackId } from '@/utils/track'
import type { Track } from '@/types/audio'

export function useTrackPage() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const appStore = useAppStore()
  const { play, toggle, currentTrack, isPlaying } = usePlayer()
  const { isDark } = useAppTheme()

  const track = ref<Partial<Track>>({})
  const success = ref(false)
  const loading = ref(true)
  const comments = ref<any[]>([])

  // --- SEO ---
  const seoTitle = computed(() => {
    if (loading.value) return `Loading Track... | ${appStore.appName}`
    if (!success.value) return `${t('Track.NotFound')} | ${appStore.appName}`
    const artist = track.value.user?.name || t('Track.UnknownArtist')
    return `${track.value.name} by ${artist} | ${appStore.appName}`
  })

  const seoDescription = computed(() => {
    if (!success.value || !track.value?.name) {
      return 'Listen to music tracks and beats on Chromatik.'
    }
    const artist = track.value.user?.name || 'an artist'
    const bpmStr = track.value.bpm ? `${track.value.bpm} BPM` : ''
    const keyStr = track.value.key ? `Key: ${track.value.key}` : ''
    const tagsStr = track.value.tags?.length ? `(${track.value.tags.slice(0, 3).join(', ')})` : ''
    const details = [bpmStr, keyStr, tagsStr].filter(Boolean).join(' • ')
    return `Listen to "${track.value.name}" by ${artist} on Chromatik. ${details ? `${details}. ` : ''}Stream, license, and download royalty-free.`
  })

  const seoImage = computed(() => {
    return track.value?.art || ''
  })

  const canonicalUrl = computed(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const userSlug = track.value?.user?.slug || (route.params.userSlug as string) || ''
    const trackSlug = track.value?.slug || (route.params.trackSlug as string) || ''
    if (!userSlug || !trackSlug) return ''
    return `${origin}/${userSlug}/${trackSlug}`
  })

  useSeo({
    title: seoTitle,
    description: seoDescription,
    canonical: canonicalUrl,
    image: seoImage,
    type: ref('music.song')
  })

  // --- Theme & Visuals ---
  const artistTheme = computed(() => {
    return track.value?.user?.profileTheme || 'ribbons'
  })

  const isThisTrackActive = computed(() => {
    const activeId = getTrackId(currentTrack.value)
    const thisId = getTrackId(track.value)
    return Boolean(activeId && thisId && activeId === thisId)
  })

  const themeVars = computed(() => {
    const palette = getThemePalette(artistTheme.value, isDark.value)
    return { '--tp-accent': palette.accent, '--tp-deep': palette.deep }
  })

  // --- Likes ---
  const { isLiked, likeCount, isOwner, toggleLike } = useTrackLike(track)
  const likePop = ref(false)
  let likePopTimer: any = null

  const onLikeClick = () => {
    const willLike = !isLiked.value
    toggleLike()
    if (willLike) {
      likePop.value = false
      clearTimeout(likePopTimer)
      requestAnimationFrame(() => {
        likePop.value = true
        likePopTimer = setTimeout(() => { likePop.value = false }, 650)
      })
    }
  }

  onBeforeUnmount(() => clearTimeout(likePopTimer))

  // --- Playback ---
  const handlePlay = () => {
    const trackId = getTrackId(track.value)
    if (!track.value || !trackId) return
    const mappedTrack = {
      ...track.value,
      id: trackId,
    }

    if (getTrackId(currentTrack.value) === trackId) {
      toggle()
    } else {
      play(mappedTrack as any)
    }
  }

  // --- Share & Feedback ---
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
  })

  const handleShare = async () => {
    const shareData = {
      title: track.value?.name || 'Track',
      text: `${track.value?.name} on ${appStore.appName}`,
      url: window.location.href
    }

    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share(shareData)
        return
      } catch (err: any) {
        if (err && err.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      snackbar.value = {
        show: true,
        text: t('Track.LinkCopied'),
        color: 'success'
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err)
    }
  }

  const findTrack = async () => {
    try {
      const response = await appStore.GET_TRACK_PAGE(route.params)
      track.value = response.data
      success.value = true
    } catch (error) {
      console.error(error)
      success.value = false
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    findTrack()
  })

  return {
    track,
    success,
    loading,
    comments,
    artistTheme,
    isThisTrackActive,
    isPlaying,
    themeVars,
    isLiked,
    likeCount,
    isOwner,
    likePop,
    snackbar,
    onLikeClick,
    handlePlay,
    handleShare,
    findTrack
  }
}
