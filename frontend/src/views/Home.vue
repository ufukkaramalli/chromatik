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
              <h5>
                <small class="caption">{{ $t('players.Last24') }}</small>
              </h5>
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
              <h5>
                <small class="caption">{{ $t('players.Alltimes') }}</small>
              </h5>
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
              <h5>
                <small class="caption">{{ $t('players.Alltimes') }}</small>
              </h5>
            </template>
          </Playlist>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import Playlist from '@/components/Playlist.vue'

const store = useStore()

// Vuex actions
const fetchRecent = () => store.dispatch('RECENT_TRACKS')
const fetchMostLiked = () => store.dispatch('MOST_LIKED')
const fetchMostStreamed = () => store.dispatch('MOST_STREAMED')

// Vuex getters
const GetRecentTracks = computed(() => store.getters['GET_RECENT_TRACKS'])
const GetMostLikedTracks = computed(() => store.getters['GET_MOST_LIKED_TRACKS'])
const GetMostStreamedTracks = computed(() => store.getters['GET_MOST_STREAMED_TRACKS'])

// Lifecycle
onMounted(() => {
  fetchRecent()
  fetchMostLiked()
  fetchMostStreamed()
})
</script>