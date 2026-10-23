<template>
  <v-main class="track-page">
    <div v-if="loading" class="d-flex align-center justify-center fill-height">
      <v-progress-circular size="64" width="6" color="primary" indeterminate></v-progress-circular>
    </div>
    
    <div v-else-if="!success" class="d-flex flex-column align-center justify-center fill-height opacity-50">
      <v-icon size="80" color="grey" class="mb-4">mdi-music-off</v-icon>
      <h2 class="text-h4 font-weight-black text-high-emphasis">{{ $t('Track.NotFound') }}</h2>
    </div>
    
    <div v-else>
      <!-- Hero Banner -->
      <TrackHeroSection
        :track="track"
        :artist-theme="artistTheme"
        :is-this-track-active="isThisTrackActive"
        :is-playing="isPlaying"
        :theme-vars="themeVars"
        :is-liked="isLiked"
        :like-count="likeCount"
        :is-owner="isOwner"
        :like-pop="likePop"
        :comments="comments"
        @play="handlePlay"
        @like="onLikeClick"
        @share="handleShare"
        @waveform-pin="handleWaveformPinClick"
        @waveform-seek="handleWaveformSeek"
      />

      <!-- Main Content -->
      <v-container class="mt-8 mb-12 px-6 px-md-12">
        <v-row>
          <v-col cols="12" md="8">
            <!-- Track Details (Description, Genres, Moods) -->
            <TrackDetailsSection :track="track" />

            <!-- Comments Section -->
            <div class="mt-10" v-if="trackId">
              <CommentSection 
                ref="commentSectionRef"
                target-type="track"
                :target-id="trackId"
                :owner-id="track.userId || track.user?._id"
                :track="track"
                :show-waveform="false"
                @comments-updated="onCommentsUpdated"
              />
            </div>
          </v-col>
          
          <v-col cols="12" md="4">
            <!-- Licenses -->
            <TrackLicensesSection :track="track" />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Notification Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      location="top" 
      :timeout="2500" 
      class="mt-4 rounded-lg"
    >
      <div class="d-flex align-center">
        <v-icon start size="20" class="mr-2">mdi-check-circle</v-icon>
        <span class="font-weight-medium">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTrackPage } from '@/composables/track/useTrackPage'
import TrackHeroSection from '@/components/Track/TrackHeroSection.vue'
import TrackLicensesSection from '@/components/Track/TrackLicensesSection.vue'
import TrackDetailsSection from '@/components/Track/TrackDetailsSection.vue'
import CommentSection from '@/components/Comments/CommentSection.vue'
import { getTrackId } from '@/utils/track'

const {
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
  handleShare
} = useTrackPage()

const commentSectionRef = ref<any>(null)
const trackId = computed(() => getTrackId(track.value))

const onCommentsUpdated = (newComments: any[]) => {
  comments.value = newComments
}

const handleWaveformPinClick = (comment: any) => {
  if (commentSectionRef.value) {
    commentSectionRef.value.scrollToComment(comment._id)
  }
}

const handleWaveformSeek = (seconds: number) => {
  if (commentSectionRef.value) {
    commentSectionRef.value.setPinnedTimestamp(Math.floor(seconds))
  }
}
</script>

<style scoped>
.track-page {
  min-height: 100vh;
}
</style>
