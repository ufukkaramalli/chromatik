<template>
  <v-footer v-if="getBottomPlayer" app fixed padless>
    <v-card width="100%" height="100%" tile>
      <!-- Progress Bar -->
      <v-progress-linear
        :buffer-value="BufferSize"
        stream
        :value="progress"
        class="my-0"
        height="5"
      />

      <v-row class="px-6">
        <!-- Track Info -->
        <v-col cols="4" class="d-flex flex-row py-1">
          <v-col class="flex-grow-0">
            <v-img
              :src="current?.art ?? ''"
              width="74"
              aspect-ratio="1"
              class="rounded-lg"
            />
          </v-col>

          <v-col class="flex-grow-1 d-flex flex-column pl-0 justify-center">
            <div class="text-uppercase font-weight-black body-1">
              <router-link
                class="routerLink"
                :title="current?.name"
                :to="{ name: 'TrackPage', params: { user: current?.user.slug, track: current?.name } }"
              >
                {{ current?.name }}
              </router-link>
            </div>
            <div class="text-uppercase body-1">
              <router-link class="routerLink" :to="current?.user.slug">
                {{ current?.user.name }}
              </router-link>
            </div>
          </v-col>
        </v-col>

        <!-- Player Controls -->
        <v-col cols="4" class="d-flex align-center justify-center">
          <v-btn class="mx-2" @click="previous" icon>
            <v-icon>mdi-rewind</v-icon>
          </v-btn>

          <v-btn v-if="!playing" class="mx-2 scale" icon @click="toggle">
            <v-icon>mdi-play</v-icon>
          </v-btn>

          <v-btn v-else class="mx-2" icon @click="toggle">
            <v-icon>mdi-pause</v-icon>
          </v-btn>

          <v-btn class="mx-2" @click="next" icon>
            <v-icon>mdi-fast-forward</v-icon>
          </v-btn>
        </v-col>

        <!-- Volume Slider -->
        <v-col cols="4" class="d-flex align-center justify-end">
          <v-col cols="5">
            <v-slider
              v-model="gainSlider"
              hide-details
              prepend-icon="mdi-volume-high"
            />
          </v-col>
        </v-col>
      </v-row>
    </v-card>
  </v-footer>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrackStore } from '@/stores/track'
import { usePlayer } from '@/composables/usePlayer'

/** ortak player mantığı (play/pause/next/prev/progress/seek) */
const {
  currentTrack: current,
  audioElement: audio,
  isPlaying: playing,
  progress,
  seek,
  next,
  previous,
  toggle,
} = usePlayer()

/** BottomPlayer’a özel ek state’ler */
const trackStore = useTrackStore()
const { bottomPlayer: getBottomPlayer, gainNode, currentTime } = storeToRefs(trackStore)

const buffer = ref(0)
const BufferSize = computed({
  get: () => buffer.value,
  set: (val) => (buffer.value = val),
})

/** audio buffer & time takibi */
watch(
  audio,
  (el) => {
    if (!el) return
    el.addEventListener('timeupdate', () => {
      if (el.buffered.length > 0 && el.duration) {
        BufferSize.value = (el.buffered.end(el.buffered.length - 1) / el.duration) * 100
      }
    })
  },
  { immediate: true }
)

/** Volume (gain) slider */
const gainSlider = computed({
  get() {
    return gainNode.value ? gainNode.value.gain.value * 100 : 100
  },
  set(value) {
    trackStore.SET_GAIN(value / 100)
  },
})
</script>