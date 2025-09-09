<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h2 class="mb-2">{{ $t('user.headers.MyTracks') }}</h2>
          <Playlist :tracks="myTracks">
            <template #title>
              <h5>{{ $t('user.headers.MyTracks') }}</h5>
            </template>
            <template #subtitle>
              <h5>
                <small class="caption">
                  {{ myTracks.length }} {{ $t('players.MostStreamed') }}
                </small>
              </h5>
            </template>
          </Playlist>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Playlist from '@/components/Playlist.vue'

const auth = useAuthStore()
const myTracks = computed(() => auth.user?.tracks || [])
</script>