<template>
  <div class="comment-section">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h3 class="text-h5 font-weight-black text-high-emphasis d-flex align-center">
        <v-icon color="primary" class="mr-3">mdi-comment-multiple-outline</v-icon>
        {{ $t('Comments.Title') }}
        <v-chip size="small" color="primary" variant="flat" class="ml-3 font-weight-black">
          {{ comments.length }}
        </v-chip>
      </h3>
    </div>

    <!-- WAVEFORM SECTION (Track Only - if showWaveform is enabled) -->
    <CommentWaveform
      v-if="showWaveform && targetType === 'track'"
      :target-id="targetId"
      :track-current-time="trackCurrentTime"
      :effective-duration="effectiveDuration"
      :playback-progress-ratio="playbackProgressRatio"
      :is-this-track-active="isThisTrackActive"
      :timestamped-comments="timestampedComments"
      @waveform-click="handleWaveformClick"
      @seek-to-comment="seekToComment"
    />

    <!-- COMMENT FORM -->
    <CommentForm
      ref="commentFormRef"
      :target-type="targetType"
      :track-current-time="trackCurrentTime"
      :pinned-timestamp="pinnedTimestamp"
      :submitting="submitting"
      :is-success="isSuccess"
      @update:pinned-timestamp="pinnedTimestamp = $event"
      @submit="submitComment"
    />

    <!-- COMMENTS LIST -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <div v-else-if="comments.length > 0" class="comments-list d-flex flex-column ga-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment._id"
        :comment="comment"
        :can-delete="canDelete(comment)"
        :is-highlighted="highlightedCommentId === comment._id"
        :is-newly-posted="justPostedCommentId === comment._id"
        @seek="seekToComment"
        @delete="confirmDelete"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="glass-card rounded-xl py-12 px-6 text-center opacity-60">
      <v-icon size="56" color="medium-emphasis" class="mb-3">mdi-comment-outline</v-icon>
      <div class="text-h6 font-weight-bold text-high-emphasis mb-1">{{ $t('Comments.NoComments') }}</div>
      <div class="text-caption text-medium-emphasis">{{ $t('Comments.NoCommentsSub') }}</div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <CommentDeleteDialog
      v-model="deleteDialog"
      :deleting="deleting"
      @confirm="executeDelete"
    />

    <!-- Feedback Toast / Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom"
      :timeout="3000"
      class="rounded-lg mb-4"
    >
      <div class="d-flex align-center">
        <v-icon start size="20" class="mr-2">{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        <span class="font-weight-medium">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usePlayer } from '@/composables/usePlayer'
import { api, isConnectionError } from '@/lib/axios'
import { getTrackId } from '@/utils/track'
import type { CommentItemData } from '@/types/comment'
import CommentWaveform from './CommentWaveform.vue'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import CommentDeleteDialog from './CommentDeleteDialog.vue'

interface Props {
  targetType: 'track' | 'soundkit'
  targetId: string
  ownerId?: string
  track?: any
  showWaveform?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showWaveform: false
})

const emit = defineEmits<{
  (e: 'comments-updated', comments: CommentItemData[]): void
}>()

const { t } = useI18n()
const auth = useAuthStore()
const { currentTrack, currentTime, duration, play, seek } = usePlayer()

const comments = ref<CommentItemData[]>([])
const loading = ref(true)
const submitting = ref(false)
const isSuccess = ref(false)
const justPostedCommentId = ref<string | null>(null)
const pinnedTimestamp = ref<number | null>(null)
const highlightedCommentId = ref<string | null>(null)
const commentFormRef = ref<InstanceType<typeof CommentForm> | null>(null)

// Feedback Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Delete Dialog
const deleteDialog = ref(false)
const commentToDelete = ref<string | null>(null)
const deleting = ref(false)

// --- Audio Playback & Waveform Computeds ---
const isThisTrackActive = computed(() => {
  if (props.targetType !== 'track') return false
  const activeId = getTrackId(currentTrack.value)
  return Boolean(activeId && props.targetId && activeId === props.targetId)
})

const trackCurrentTime = computed(() => {
  return isThisTrackActive.value ? currentTime.value : 0
})

const effectiveDuration = computed(() => {
  if (isThisTrackActive.value && duration.value > 0) {
    return duration.value
  }
  return props.track?.duration || 180
})

const playbackProgressRatio = computed(() => {
  if (!effectiveDuration.value || effectiveDuration.value <= 0) return 0
  return Math.min(1, Math.max(0, trackCurrentTime.value / effectiveDuration.value))
})

const timestampedComments = computed(() => {
  return comments.value.filter(c => typeof c.audioTimestamp === 'number' && c.audioTimestamp >= 0)
})

const handleWaveformClick = (percent: number) => {
  const targetSeconds = (percent / 100) * effectiveDuration.value
  pinnedTimestamp.value = Math.floor(targetSeconds)

  if (isThisTrackActive.value) {
    seek(percent)
  } else if (props.track) {
    const mappedTrack = {
      ...props.track,
      id: getTrackId(props.track)
    }
    play(mappedTrack)
    setTimeout(() => {
      seek(percent)
    }, 150)
  }
}

const seekToComment = (comment: CommentItemData) => {
  if (typeof comment.audioTimestamp !== 'number') return
  const targetSeconds = comment.audioTimestamp
  const percent = (targetSeconds / effectiveDuration.value) * 100

  if (isThisTrackActive.value) {
    seek(percent)
  } else if (props.track) {
    const mappedTrack = {
      ...props.track,
      id: getTrackId(props.track)
    }
    play(mappedTrack)
    setTimeout(() => {
      seek(percent)
    }, 150)
  }

  highlightedCommentId.value = comment._id
  nextTick(() => {
    const el = document.getElementById(`comment-${comment._id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// --- API Actions ---
const fetchComments = async () => {
  if (!props.targetId) return
  try {
    loading.value = true
    const res = await api.get(`/comments/${props.targetType}/${props.targetId}`)
    comments.value = res.data.comments || []
    emit('comments-updated', comments.value)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  } finally {
    loading.value = false
  }
}

const submitComment = async (content: string, timestamp: number | null) => {
  if (!content.trim() || submitting.value) return
  try {
    submitting.value = true
    const payload: any = { content }
    if (props.targetType === 'track' && timestamp !== null) {
      payload.audioTimestamp = timestamp
    }

    const minWait = new Promise(resolve => setTimeout(resolve, 500))
    const [res] = await Promise.all([
      api.post(`/comments/${props.targetType}/${props.targetId}`, payload),
      minWait
    ])

    if (res.data?.comment) {
      const createdComment = res.data.comment
      comments.value.unshift(createdComment)
      justPostedCommentId.value = createdComment._id
      emit('comments-updated', comments.value)

      commentFormRef.value?.clearInput()
      pinnedTimestamp.value = null

      isSuccess.value = true
      snackbar.value = {
        show: true,
        text: t('Comments.SuccessMsg'),
        color: 'success'
      }

      setTimeout(() => {
        isSuccess.value = false
      }, 1800)

      setTimeout(() => {
        if (justPostedCommentId.value === createdComment._id) {
          justPostedCommentId.value = null
        }
      }, 3500)
    }
  } catch (error) {
    console.error('Failed to submit comment:', error)
    if (!isConnectionError(error)) {
      snackbar.value = {
        show: true,
        text: t('Comments.ErrorMsg'),
        color: 'error'
      }
    }
  } finally {
    submitting.value = false
  }
}

const canDelete = (comment: CommentItemData) => {
  if (!auth.authenticated) return false
  const currentUserId = auth.user?._id
  const isAuthor = comment.userId?._id === currentUserId || comment.userId === currentUserId
  const isOwner = props.ownerId === currentUserId
  const isAdmin = auth.user?.role === 'admin'
  return isAuthor || isOwner || isAdmin
}

const confirmDelete = (commentId: string) => {
  commentToDelete.value = commentId
  deleteDialog.value = true
}

const executeDelete = async () => {
  if (!commentToDelete.value) return
  try {
    deleting.value = true
    await api.delete(`/comments/${commentToDelete.value}`)
    comments.value = comments.value.filter(c => c._id !== commentToDelete.value)
    emit('comments-updated', comments.value)
    deleteDialog.value = false
    commentToDelete.value = null
  } catch (error) {
    console.error('Failed to delete comment:', error)
  } finally {
    deleting.value = false
  }
}

const scrollToCommentId = (commentId: string) => {
  highlightedCommentId.value = commentId
  nextTick(() => {
    const el = document.getElementById(`comment-${commentId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

defineExpose({
  scrollToComment: scrollToCommentId,
  setPinnedTimestamp: (t: number) => { pinnedTimestamp.value = t }
})

onMounted(() => {
  fetchComments()
})
</script>

<style scoped lang="scss">
.comment-section {
  width: 100%;
}

.glass-card {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
}
</style>
