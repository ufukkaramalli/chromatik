<template>
  <div class="glass-card rounded-xl pa-5 mb-8 comment-form-box">
    <div v-if="auth.authenticated" class="d-flex align-start">
      <v-avatar size="44" class="mr-4 flex-shrink-0 elevation-4">
        <v-img :src="currentUserPhoto" cover />
      </v-avatar>

      <div class="flex-grow-1">
        <!-- Active Timestamp Pin Controls (Track only) -->
        <div v-if="targetType === 'track'" class="d-flex align-center flex-wrap ga-2 mb-3">
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
              @click="emit('update:pinnedTimestamp', null)"
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
            @click="emit('update:pinnedTimestamp', Math.floor(trackCurrentTime))"
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
          @keydown.ctrl.enter="handleSubmit"
          @keydown.meta.enter="handleSubmit"
        />

        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
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
            @click="handleSubmit"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatTime } from '@/utils/format'

const props = defineProps<{
  targetType: 'track' | 'soundkit'
  trackCurrentTime: number
  pinnedTimestamp: number | null
  submitting: boolean
  isSuccess: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', content: string, timestamp: number | null): void
  (e: 'update:pinnedTimestamp', val: number | null): void
}>()

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const newComment = ref('')
const currentUserPhoto = computed<string>(() => (auth.user as any)?.photoUrl || '/no-photo-user.jpg')

const handleSubmit = () => {
  if (!newComment.value.trim() || props.submitting) return
  emit('submit', newComment.value.trim(), props.pinnedTimestamp)
}

const clearInput = () => {
  newComment.value = ''
}

const goToLogin = () => {
  router.push({ name: 'Login', query: { redirect: route.fullPath } })
}

defineExpose({
  clearInput
})
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.75)) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
}

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

.post-comment-btn {
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;

  &.btn-success-pop {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.5) !important;
  }
}
</style>
