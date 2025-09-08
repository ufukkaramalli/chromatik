<template>
  <v-footer v-if="getBottomPlayer" app fixed padless>
    <v-card width="100%" height="100%" tile>
      <!-- Progress Bar -->
      <v-progress-linear
        :buffer-value="BufferSize"
        stream
        :value="(currentTime / getAudioElement.duration) * 100"
        class="my-0"
        height="5"
      />

      <v-row class="px-6">
        <!-- Track Info -->
        <v-col cols="4" class="d-flex flex-row py-1">
          <v-col class="flex-grow-0">
            <v-img
              :src="getCurrentTrack.art ?? ''"
              width="74"
              aspect-ratio="1"
              class="rounded-lg"
            />
          </v-col>

          <v-col class="flex-grow-1 d-flex flex-column pl-0 justify-center">
            <div class="text-uppercase font-weight-black body-1">
              <router-link
                class="routerLink"
                :title="getCurrentTrack.name"
                :to="{ name: 'TrackPage', params: { user: getCurrentTrack.user.slug, track: getCurrentTrack.name } }"
              >{{ getCurrentTrack.name }}</router-link>
            </div>
            <div class="text-uppercase body-1">
              <router-link class="routerLink" :to="getCurrentTrack.user.slug">
                {{ getCurrentTrack.user.name }}
              </router-link>
            </div>
          </v-col>
        </v-col>

        <!-- Player Controls -->
        <v-col cols="4" class="d-flex align-center justify-center">
          <v-btn class="mx-2" @click="previousTrack" icon>
            <v-icon>mdi-rewind</v-icon>
          </v-btn>

          <v-btn
            v-if="!getPlaying"
            class="mx-2 scale"
            icon
            @click="btnPlay"
          >
            <v-icon>mdi-play</v-icon>
          </v-btn>

          <v-btn v-else class="mx-2" icon @click="btnPause">
            <v-icon>mdi-pause</v-icon>
          </v-btn>

          <v-btn class="mx-2" @click="nextTrack" icon>
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
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const getCurrentTrack = computed(() => store.getters['track/GET_CURRENT_TRACK'])
const getAudioElement = computed(() => store.getters['track/GET_AUDIO_ELEMENT'])
const getCurrentTime = computed(() => store.getters['track/GET_CURRENT_TIME'])
const getGain = computed(() => store.getters['track/GET_GAIN'])
const getPlaying = computed(() => store.getters['track/GET_PLAYING'])
const getBottomPlayer = computed(() => store.getters['track/GET_BOTTOM_PLAYER'])
const getCurrentTrackIndex = computed(() => store.getters['track/GET_CURRENT_TRACK_INDEX'])

const buffer = ref(0)
const currentTime = ref(0)

const gainSlider = computed({
  get() { return getAudioElement.value ? getGain.value * 100 : 100 },
  set(value) { store.commit('track/SET_GAIN', value / 100) }
})

const BufferSize = computed({
  get: () => buffer.value,
  set: (val) => buffer.value = val
})

watch(getAudioElement, (newEl) => {
  if (newEl) {
    newEl.addEventListener('timeupdate', () => {
      if (newEl.buffered.length > 0) {
        BufferSize.value = (newEl.buffered.end(newEl.buffered.length - 1) / newEl.duration) * 100
      }
      currentTime.value = newEl.currentTime
    })
  }
}, { immediate: true })

watch(getCurrentTime, (val) => {
  if (getAudioElement.value) currentTime.value = val
})

const nextTrack = () => store.dispatch('track/SET_NEXT_TRACK')
const previousTrack = () => store.dispatch('track/SET_PREVIOUS_TRACK')
const btnPlay = () => {
  store.dispatch('track/clickedPlay', { trackIndex: getCurrentTrackIndex.value, track: getCurrentTrack.value })
}
const btnPause = () => {
  if (getAudioElement.value) {
    getAudioElement.value.pause()
    store.commit('track/SET_IS_PLAYING', false)
  }
}
</script>
