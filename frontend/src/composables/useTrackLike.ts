import { ref, computed, watch, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/axios'
import type { TrackLike } from '@/types/audio'
import { getTrackId } from '@/utils/track'

export interface LikeChange {
  trackId: string
  isLiked: boolean
  likes: number
}

/**
 * Shared like state for a track (BoxPlayer, TrackPage, ...).
 *
 * The track payload is the source of truth; local overrides hold the latest
 * optimistic / server values so callers never need to mutate the track object and
 * never snap back to stale `likedBy` data. Overrides reset when the track or user changes.
 */
export function useTrackLike(
  track: Ref<TrackLike | null | undefined>,
  options: { onChange?: (change: LikeChange) => void } = {}
) {
  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()

  const likedOverride = ref<boolean | null>(null)
  const countOverride = ref<number | null>(null)
  const likePending = ref(false)

  const trackId = computed(() => getTrackId(track.value))

  const isOwner = computed(() => {
    const user = track.value?.user
    if (!auth.authenticated || !user) return false
    return (Boolean(user._id) && auth.user?._id === user._id) ||
      (Boolean(user.slug) && auth.user?.slug === user.slug)
  })

  const likedFromPayload = computed(() => {
    const userId = auth.user?._id
    const likedBy = track.value?.likedBy
    if (!userId || !likedBy) return false
    return likedBy.some(id => String(id) === String(userId))
  })

  const isLiked = computed(() => likedOverride.value ?? likedFromPayload.value)
  const likeCount = computed(() => countOverride.value ?? track.value?.likes ?? 0)

  watch([trackId, () => auth.user?._id], () => {
    likedOverride.value = null
    countOverride.value = null
  })

  const toggleLike = async () => {
    if (!auth.authenticated) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
      return
    }
    const id = trackId.value
    if (!id || likePending.value || isOwner.value) return

    const prevLiked = isLiked.value
    const prevCount = likeCount.value

    // Optimistic
    likedOverride.value = !prevLiked
    countOverride.value = Math.max(0, prevCount + (prevLiked ? -1 : 1))
    likePending.value = true

    try {
      const { data } = await api.post<{ isLiked: boolean; likes: number }>(`/track/${id}/like`)
      likedOverride.value = data.isLiked
      countOverride.value = data.likes
      options.onChange?.({ trackId: id, isLiked: data.isLiked, likes: data.likes })
    } catch (err) {
      likedOverride.value = prevLiked
      countOverride.value = prevCount
      console.error('Like action failed', err)
    } finally {
      likePending.value = false
    }
  }

  return { isLiked, likeCount, isOwner, likePending, toggleLike }
}
