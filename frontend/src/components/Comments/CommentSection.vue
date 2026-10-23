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
    <div 
      v-if="showWaveform && targetType === 'track'" 
      class="glass-card rounded-xl pa-5 mb-8 waveform-container position-relative overflow-hidden"
    >
      <div class="d-flex align-center justify-space-between mb-3 text-caption text-medium-emphasis">
        <span class="d-flex align-center">
          <v-icon size="small" color="primary" class="mr-1">mdi-waveform</v-icon>
          <span class="text-high-emphasis font-weight-bold">{{ formatTime(trackCurrentTime) }}</span>
          <span class="mx-1">/</span>
          <span>{{ formatTime(effectiveDuration) }}</span>
        </span>
        <span class="waveform-hint-text d-none d-sm-inline opacity-70">
          {{ $t('Comments.WaveformHint') }}
        </span>
      </div>

      <!-- Waveform Interactive Track -->
      <div 
        class="waveform-bar-wrapper position-relative"
        ref="waveformRef"
        @mousemove="handleWaveformHover"
        @mouseleave="hoverTimestamp = null"
        @click="handleWaveformClick"
      >
        <!-- Background Bars -->
        <div class="waveform-bars d-flex align-center justify-space-between h-100">
          <div 
            v-for="(bar, index) in waveformBars" 
            :key="index"
            class="waveform-bar"
            :class="{ 'is-played': (index / waveformBars.length) <= playbackProgressRatio }"
            :style="{ height: bar + '%' }"
          ></div>
        </div>

        <!-- Playhead Line -->
        <div 
          v-if="isThisTrackActive || trackCurrentTime > 0"
          class="waveform-playhead"
          :style="{ left: (playbackProgressRatio * 100) + '%' }"
        ></div>

        <!-- Hover Indicator -->
        <div 
          v-if="hoverPercent !== null"
          class="waveform-hover-line"
          :style="{ left: hoverPercent + '%' }"
        >
          <span class="hover-time-tag font-weight-bold">{{ formatTime(hoverTimestamp) }}</span>
        </div>

        <!-- Comment Pins / Markers on Waveform -->
        <div 
          v-for="comment in timestampedComments" 
          :key="comment._id"
          class="comment-pin-marker"
          :style="{ left: getCommentPinPercent(comment.audioTimestamp) + '%' }"
          @click.stop="seekToComment(comment)"
        >
          <GlassTooltip location="top" :offset="14">
            <div class="pin-tooltip text-left pa-1">
              <div class="d-flex align-center justify-space-between mb-1 ga-2">
                <span class="font-weight-bold text-high-emphasis text-caption">{{ comment.userId?.name }}</span>
                <span class="font-mono text-caption text-primary font-weight-bold">{{ formatTime(comment.audioTimestamp) }}</span>
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ comment.content }}
              </div>
            </div>
          </GlassTooltip>

          <v-avatar size="24" class="pin-avatar shadow-premium">
            <v-img :src="comment.userId?.photoUrl || '/no-photo-user.jpg'" cover />
          </v-avatar>
        </div>
      </div>
    </div>

    <!-- COMMENT FORM -->
    <div class="glass-card rounded-xl pa-5 mb-8 comment-form-box">
      <div v-if="auth.authenticated" class="d-flex align-start">
        <v-avatar size="44" class="mr-4 flex-shrink-0 elevation-4">
          <v-img :src="currentUserPhoto" cover />
        </v-avatar>

        <div class="flex-grow-1">
          <!-- Active Timestamp Pin Controls (Track only) -->
          <div v-if="targetType === 'track'" class="d-flex align-center flex-wrap gap-2 mb-3">
            <v-chip 
              v-if="pinnedTimestamp !== null"
              color="primary" 
              variant="flat" 
              size="small" 
              class="font-weight-bold pr-1"
            >
              <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
              {{ formatTime(pinnedTimestamp) }}
              <v-btn 
                icon 
                variant="text" 
                size="x-small" 
                class="ml-1" 
                :title="$t('Comments.ClearPin')"
                @click="pinnedTimestamp = null"
              >
                <v-icon size="14">mdi-close</v-icon>
              </v-btn>
            </v-chip>

            <v-btn 
              v-else-if="trackCurrentTime > 0"
              variant="outlined" 
              color="primary" 
              size="small" 
              rounded="pill"
              class="font-weight-bold text-none"
              @click="pinnedTimestamp = Math.floor(trackCurrentTime)"
            >
              <v-icon size="small" class="mr-1">mdi-pin</v-icon>
              {{ $t('Comments.PinAt') }} {{ formatTime(trackCurrentTime) }}
            </v-btn>
          </div>

          <v-textarea
            v-model="newComment"
            :placeholder="targetType === 'track' ? $t('Comments.Placeholder') : $t('Comments.PlaceholderSoundkit')"
            variant="solo-filled"
            flat
            rounded="lg"
            rows="2"
            auto-grow
            hide-details
            maxlength="500"
            class="comment-textarea mb-3"
            :loading="submitting"
            :disabled="submitting"
            @keydown.ctrl.enter="submitComment"
            @keydown.meta.enter="submitComment"
          />

          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <span class="text-caption text-medium-emphasis">
              {{ newComment.length }}/500
            </span>
            <v-btn
              :color="isSuccess ? 'success' : 'primary'"
              rounded="pill"
              class="px-6 font-weight-bold post-comment-btn"
              :class="{ 'btn-success-pop': isSuccess }"
              :loading="submitting"
              :disabled="(!newComment.trim() && !isSuccess) || submitting"
              @click="submitComment"
            >
              <v-icon class="mr-2">{{ isSuccess ? 'mdi-check-circle' : 'mdi-send' }}</v-icon>
              {{ isSuccess ? $t('Comments.Posted') : (submitting ? $t('Comments.Posting') : $t('Comments.Post')) }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Guest Login Prompt -->
      <div v-else class="text-center py-4">
        <p class="text-body-1 text-medium-emphasis mb-4">{{ $t('Comments.LoginPrompt') }}</p>
        <v-btn color="primary" rounded="pill" class="px-8 font-weight-bold" @click="goToLogin">
          <v-icon class="mr-2">mdi-login</v-icon>
          {{ $t('Comments.LoginBtn') }}
        </v-btn>
      </div>
    </div>

    <!-- COMMENTS LIST -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <div v-else-if="comments.length > 0" class="comments-list d-flex flex-column gap-4">
      <v-card 
        v-for="comment in comments" 
        :key="comment._id"
        :id="`comment-${comment._id}`"
        class="glass-card comment-card rounded-xl pa-5 transition-all"
        :class="{ 
          'highlighted-comment': highlightedCommentId === comment._id,
          'newly-posted-comment': justPostedCommentId === comment._id
        }"
      >
        <div class="d-flex align-start justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-avatar 
              size="40" 
              class="mr-3 cursor-pointer elevation-3"
              @click="goToUserProfile(comment.userId?.slug)"
            >
              <v-img :src="comment.userId?.photoUrl || '/no-photo-user.jpg'" cover />
            </v-avatar>

            <div>
              <div class="d-flex align-center flex-wrap gap-2">
                <span 
                  class="font-weight-black text-high-emphasis hover-underline cursor-pointer"
                  @click="goToUserProfile(comment.userId?.slug)"
                >
                  {{ comment.userId?.name || 'User' }}
                </span>

                <!-- Timestamp Pill in Comment Card -->
                <v-chip 
                  v-if="typeof comment.audioTimestamp === 'number'"
                  color="primary"
                  variant="tonal"
                  size="x-small"
                  class="font-weight-bold cursor-pointer hover-glow-chip"
                  @click="seekToComment(comment)"
                >
                  <v-icon size="x-small" class="mr-1">mdi-play</v-icon>
                  {{ formatTime(comment.audioTimestamp) }}
                </v-chip>
              </div>

              <span class="text-caption text-medium-emphasis">
                {{ formatRelativeTime(comment.createdAt) }}
              </span>
            </div>
          </div>

          <!-- Delete Action -->
          <v-btn 
            v-if="canDelete(comment)"
            icon 
            variant="text" 
            size="small" 
            color="medium-emphasis"
            class="delete-comment-btn"
            :title="$t('Comments.Delete')"
            @click="confirmDelete(comment._id)"
          >
            <v-icon size="18">mdi-delete-outline</v-icon>
          </v-btn>
        </div>

        <!-- Comment Content -->
        <div class="text-body-1 text-high-emphasis comment-text pl-13">
          {{ comment.content }}
        </div>
      </v-card>
    </div>

    <!-- Empty State -->
    <div v-else class="glass-card rounded-xl py-12 px-6 text-center opacity-60">
      <v-icon size="56" color="medium-emphasis" class="mb-3">mdi-comment-outline</v-icon>
      <div class="text-h6 font-weight-bold text-high-emphasis mb-1">{{ $t('Comments.NoComments') }}</div>
      <div class="text-caption text-medium-emphasis">{{ $t('Comments.NoCommentsSub') }}</div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="glass-card rounded-xl pa-5">
        <v-card-title class="text-h6 font-weight-black text-high-emphasis pa-0 mb-3">
          {{ $t('Comments.Delete') }}
        </v-card-title>
        <v-card-text class="pa-0 mb-6 text-body-2 text-medium-emphasis">
          {{ $t('Comments.DeleteConfirm') }}
        </v-card-text>
        <v-card-actions class="pa-0 d-flex justify-end gap-2">
          <v-btn variant="text" color="medium-emphasis" rounded="pill" @click="deleteDialog = false">
            {{ $t('Comments.Cancel') }}
          </v-btn>
          <v-btn color="error" variant="flat" rounded="pill" :loading="deleting" @click="executeDelete">
            {{ $t('Comments.Delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usePlayer } from '@/composables/usePlayer'
import { api, isConnectionError } from '@/lib/axios'
import { formatTime } from '@/utils/format'
import { getTrackId } from '@/utils/track'

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
  (e: 'comments-updated', comments: any[]): void
}>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const auth = useAuthStore()
const currentUserPhoto = computed<string>(() => (auth.user as any)?.photoUrl || '/no-photo-user.jpg')
const { currentTrack, isPlaying, currentTime, duration, play, seek } = usePlayer()

const comments = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const isSuccess = ref(false)
const justPostedCommentId = ref<string | null>(null)
const newComment = ref('')
const pinnedTimestamp = ref<number | null>(null)
const waveformRef = ref<HTMLElement | null>(null)
const hoverPercent = ref<number | null>(null)
const hoverTimestamp = ref<number | null>(null)
const highlightedCommentId = ref<string | null>(null)

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
  return props.track?.duration || 180 // Default to 3 minutes fallback
})

const playbackProgressRatio = computed(() => {
  if (!effectiveDuration.value || effectiveDuration.value <= 0) return 0
  return Math.min(1, Math.max(0, trackCurrentTime.value / effectiveDuration.value))
})

// Generate consistent visual waveform bars based on targetId seed
const waveformBars = computed(() => {
  const barsCount = 75
  const seedStr = props.targetId || 'default-seed'
  let seed = 0
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) & 0xffffffff
  }

  const random = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 4294967296
  }

  const bars: number[] = []
  for (let i = 0; i < barsCount; i++) {
    // Generate organic-looking music heights with intro, drops, and outro
    const progress = i / barsCount
    const envelope = Math.sin(progress * Math.PI) // Peak in middle
    const variance = random() * 60 + 20
    const height = Math.min(95, Math.max(15, Math.floor(envelope * variance + 18)))
    bars.push(height)
  }
  return bars
})

const timestampedComments = computed(() => {
  return comments.value.filter(c => typeof c.audioTimestamp === 'number' && c.audioTimestamp >= 0)
})

const getCommentPinPercent = (timestamp: number) => {
  if (!effectiveDuration.value || effectiveDuration.value <= 0) return 0
  return Math.min(98, Math.max(2, (timestamp / effectiveDuration.value) * 100))
}

// --- Waveform Interaction Handlers ---
const handleWaveformHover = (e: MouseEvent) => {
  if (!waveformRef.value) return
  const rect = waveformRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  hoverPercent.value = percent
  hoverTimestamp.value = (percent / 100) * effectiveDuration.value
}

const handleWaveformClick = (e: MouseEvent) => {
  if (!waveformRef.value) return
  const rect = waveformRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  const percent = (x / rect.width) * 100
  const targetSeconds = (percent / 100) * effectiveDuration.value

  // Set as comment timestamp if user is typing
  pinnedTimestamp.value = Math.floor(targetSeconds)

  // Seek or play audio
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

const seekToComment = (comment: any) => {
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

  // Highlight and scroll to comment
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

const submitComment = async () => {
  if (!newComment.value.trim() || submitting.value) return
  try {
    submitting.value = true
    const payload: any = {
      content: newComment.value.trim()
    }
    if (props.targetType === 'track' && pinnedTimestamp.value !== null) {
      payload.audioTimestamp = pinnedTimestamp.value
    }

    // UX Micro-delay: guarantees minimum 500ms so the user sees the spinner and feels the request being processed
    const minWait = new Promise(resolve => setTimeout(resolve, 500))
    const [res] = await Promise.all([
      api.post(`/comments/${props.targetType}/${props.targetId}`, payload),
      minWait
    ])

    if (res.data.comment) {
      const createdComment = res.data.comment
      comments.value.unshift(createdComment)
      justPostedCommentId.value = createdComment._id
      emit('comments-updated', comments.value)

      newComment.value = ''
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
    // Connection problems are announced once by the global ConnectionSnackbar
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

const canDelete = (comment: any) => {
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

const scrollToComment = (commentId: string) => {
  highlightedCommentId.value = commentId
  nextTick(() => {
    const el = document.getElementById(`comment-${commentId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

defineExpose({
  scrollToComment,
  setPinnedTimestamp: (t: number) => { pinnedTimestamp.value = t }
})

// --- Formatting Helpers ---
const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return ''
  const past = new Date(dateStr).getTime()
  const now = Date.now()
  const diffMinutes = Math.floor((now - past) / (1000 * 60))
  if (diffMinutes < 1) return t('Comments.JustNow')
  if (diffMinutes < 60) return `${diffMinutes} ${t('Comments.MinutesAgo')}`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ${t('Comments.HoursAgo')}`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ${t('Comments.DaysAgo')}`
}

const goToUserProfile = (slug?: string) => {
  if (!slug) return
  router.push({ name: 'Profile', params: { userSlug: slug } })
}

const goToLogin = () => {
  router.push({ name: 'Login', query: { redirect: route.fullPath } })
}

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

/* Waveform Container */
.waveform-container {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), 0.8) !important;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, var(--v-shadow-strength, 0.2));
}

.waveform-bar-wrapper {
  height: 64px;
  width: 100%;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px 0;
}

.waveform-bars {
  gap: 3px;
}

.waveform-bar {
  flex: 1;
  background: rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 4px;
  transition: background 0.15s ease, transform 0.15s ease;
  min-width: 2px;

  &.is-played {
    background: linear-gradient(to top, rgba(var(--v-theme-primary), 0.7), rgb(var(--v-theme-primary)));
    box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.3);
  }
}

.waveform-bar-wrapper:hover .waveform-bar {
  opacity: 0.9;
}

/* Playhead Line */
.waveform-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.9), 0 0 4px rgb(var(--v-theme-primary));
  pointer-events: none;
  z-index: 4;
}

/* Hover Line */
.waveform-hover-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(var(--v-theme-on-surface), 0.6);
  pointer-events: none;
  z-index: 5;

  .hover-time-tag {
    position: absolute;
    bottom: -22px;
    transform: translateX(-50%);
    font-size: 10px;
    background: rgba(var(--v-glass-bg, var(--v-theme-surface)), 0.9);
    padding: 2px 6px;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
    border: 1px solid rgba(var(--v-border-color), 0.2);
  }
}

/* Comment Marker Pins */
.comment-pin-marker {
  position: absolute;
  top: -8px;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 6;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(-50%) scale(1.25);
    z-index: 7;
  }
}

.pin-avatar {
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.6);
}

/* Form Styles */
.comment-form-box {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
}

.comment-textarea :deep(.v-field) {
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
  border-radius: 12px !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  transition: all 0.2s ease;

  &:hover, &.v-field--focused {
    border-color: rgba(var(--v-theme-primary), 0.5) !important;
    box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.15) !important;
  }
}

/* Comment Cards */
.comment-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-color: rgba(var(--v-border-color), var(--v-border-opacity, 0.06)) !important;

  &:hover {
    border-color: rgba(var(--v-border-color), 0.18) !important;
    background: rgba(var(--v-theme-on-surface), 0.04) !important;
  }

  &.highlighted-comment {
    border-color: rgb(var(--v-theme-primary)) !important;
    box-shadow: 0 0 24px rgba(var(--v-theme-primary), 0.25) !important;
    background: rgba(var(--v-theme-primary), 0.05) !important;
  }

  &.newly-posted-comment {
    animation: commentPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, commentSuccessPulse 3.5s ease-out forwards;
  }
}

@keyframes commentPopIn {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes commentSuccessPulse {
  0% {
    border-color: rgba(var(--v-theme-primary), 0.85) !important;
    box-shadow: 0 0 24px rgba(var(--v-theme-primary), 0.4), 0 8px 30px rgba(0, 0, 0, var(--v-shadow-strength, 0.3)) !important;
    background: rgba(var(--v-theme-primary), 0.12) !important;
  }
  60% {
    border-color: rgba(var(--v-theme-primary), 0.5) !important;
    box-shadow: 0 0 16px rgba(var(--v-theme-primary), 0.2) !important;
    background: rgba(var(--v-theme-primary), 0.06) !important;
  }
  100% {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
    box-shadow: none !important;
    background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
  }
}

.post-comment-btn {
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;

  &.btn-success-pop {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.5) !important;
  }
}

.comment-text {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.hover-glow-chip {
  transition: all 0.2s ease;
  &:hover {
    box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.4);
    transform: scale(1.05);
  }
}

.hover-underline:hover {
  text-decoration: underline;
}

.delete-comment-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 1;
    color: rgb(var(--v-theme-error)) !important;
  }
}

.shadow-premium {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.pl-13 { padding-left: 52px; }
</style>
