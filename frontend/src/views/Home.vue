<template>
  <v-main v-cloak>
    <v-container>
      <v-row align="center" justify="center">
        <!-- Recent Tracks -->
        <v-col cols="12" class="secondary darken-2 rounded-lg mb-2">
          <Playlist :tracks="GetRecentTracks" v-bind="$attrs">
            <template #title>
              <h5>{{ $t('players.Recent') }}</h5>
            </template>
            <template #subtitle>
              <h5><small class="caption">{{ $t('players.Last24') }}</small></h5>
            </template>
          </Playlist>
        </v-col>

        <!-- Most Liked -->
        <v-col cols="12" class="secondary darken-2 rounded-lg mb-2">
          <Playlist :tracks="GetMostLikedTracks" v-bind="$attrs">
            <template #title>
              <h5>{{ $t('players.MostLiked') }}</h5>
            </template>
            <template #subtitle>
              <h5><small class="caption">{{ $t('players.Alltimes') }}</small></h5>
            </template>
          </Playlist>
        </v-col>

        <!-- Most Streamed -->
        <v-col cols="12" class="secondary darken-2 rounded-lg mb-2">
          <Playlist :tracks="GetMostStreamedTracks" v-bind="$attrs">
            <template #title>
              <h5>{{ $t('players.MostStreamed') }}</h5>
            </template>
            <template #subtitle>
              <h5><small class="caption">{{ $t('players.Alltimes') }}</small></h5>
            </template>
          </Playlist>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import Playlist from '@/components/Playlist.vue'

const app = useAppStore()
const {
  GET_RECENT_TRACKS: GetRecentTracks,
  GET_MOST_LIKED_TRACKS: GetMostLikedTracks,
  GET_MOST_STREAMED_TRACKS: GetMostStreamedTracks
} = storeToRefs(app)

onMounted(() => {
  app.RECENT_TRACKS()
  app.MOST_LIKED()
  app.MOST_STREAMED()
})
</script>