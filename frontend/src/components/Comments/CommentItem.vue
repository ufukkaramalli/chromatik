<template>
  <v-card 
    :id="`comment-${comment._id}`"
    class="glass-card comment-card rounded-xl pa-5 transition-all"
    :class="{ 
      'highlighted-comment': isHighlighted,
      'newly-posted-comment': isNewlyPosted
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
          <div class="d-flex align-center flex-wrap ga-2">
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
              @click="emit('seek', comment)"
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
        v-if="canDelete"
        icon 
        variant="text" 
        size="small" 
        color="medium-emphasis"
        class="delete-comment-btn"
        :title="$t('Comments.Delete')"
        @click="emit('delete', comment._id)"
      >
        <v-icon size="18">mdi-delete-outline</v-icon>
      </v-btn>
    </div>

    <!-- Comment Content -->
    <div class="text-body-1 text-high-emphasis comment-text pl-13">
      {{ comment.content }}
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { CommentItemData } from '@/types/comment'
import { formatTime } from '@/utils/format'

const props = defineProps<{
  comment: CommentItemData
  canDelete: boolean
  isHighlighted: boolean
  isNewlyPosted: boolean
}>()

const emit = defineEmits<{
  (e: 'seek', comment: CommentItemData): void
  (e: 'delete', commentId: string): void
}>()

const router = useRouter()
const { t } = useI18n()

const formatRelativeTime = (dateStr?: string) => {
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
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
}

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

.pl-13 {
  padding-left: 52px;
}
</style>
