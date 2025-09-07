<template>
  <v-hover>
    <template v-slot="{ hover }">
      <v-card
        class="mx-auto"
        rounded="lg"
        :elevation="hover ? 6 : 2"
        color="secondary"
        dark
        v-ripple="{ class: 'white--text', center: true }"
        :loading="currentTrack && getIsLoading"
      >
        <!-- Progress Slot -->
        <template v-slot:progress>
          <v-progress-linear absolute indeterminate color="primary"></v-progress-linear>
        </template>

        <!-- Track Image -->
        <v-img
          :src="getTrack.art"
          :lazy-src="getTrack.art"
          aspect-ratio="1"
          :gradient="hover || currentTrack ? grad : ''"
        >
          <v-fade-transition>
            <v-overlay
              v-if="hover || currentTrack"
              absolute
              color="primary"
              class="d-flex align-center text-center"
              style="width:100%;"
            >
              <v-icon @click="addToPlaylist">mdi-playlist-plus</v-icon>

              <v-col cols="12" class="d-flex justify-center">
                <v-btn
                  v-if="!isPlaying"
                  :loading="currentTrack && getIsLoading"
                  @click="btnPlay"
                  class="mx-2"
                  fab
                  large
                  dark
                  :color="btnColor"
                >
                  <v-icon dark>mdi-play</v-icon>
                </v-btn>

                <v-btn
                  v-else
                  :loading="currentTrack && getIsLoading"
                  @click="btnPause"
                  class="mx-2"
                  fab
                  large
                  dark
                  :color="btnColor"
                >
                  <v-icon dark>mdi-pause</v-icon>
                </v-btn>
              </v-col>

              <v-icon @click="like">
                {{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
              </v-icon>
            </v-overlay>
          </v-fade-transition>

          <!-- Placeholder -->
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-row>
          </template>
        </v-img>

        <!-- Track Title -->
        <div
          ref="title"
          class="text-truncate text-wrap text-left py-1 px-2 mt-1 text-uppercase font-weight-black body-1"
        >
          <router-link
            :title="getTrack.name"
            class="routerLink"
            :to="{ name: 'TrackPage', params: { userSlug: getTrack.user.slug, trackSlug: getTrack.slug, track: getTrack } }"
          >
            {{ getTrack.name.toUpperCase() }}
          </router-link>
        </div>

        <!-- Artist -->
        <v-card-text
          ref="artist"
          class="text-truncate text-wrap text-left py-1 px-2 text-uppercase mt-n2"
        >
          <router-link :title="getTrack.user.name" class="routerLink" :to="getTrack.user.slug">
            {{ getTrack.user.name.toUpperCase() }}
          </router-link>
        </v-card-text>
      </v-card>
    </template>
  </v-hover>
</template>

<script setup>
import { reactive, toRefs, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const props = defineProps({
  getTrack: { type: Object, required: true },
  currentTrack: { type: Object },
  isPlaying: { type: Boolean, default: false },
  btnColor: { type: String, default: 'primary' },
  trackIndex: { type: Number }
})

const store = useStore()
const router = useRouter()

const state = reactive({
  grad: 'to bottom, rgba(171, 41, 41, 0.4) 45%, rgba(0, 0, 0, 0.8) 100%',
  liked: false
})

const user = computed(() => store.getters['auth/user'])
const authenticated = computed(() => store.getters['auth/authenticated'])
const getIsLoading = computed(() => store.getters['track/GET_IS_LOADING'])
const getAudioElement = computed(() => store.getters['track/GET_AUDIO_ELEMENT'])

const isLiked = computed({
  get: () => state.liked,
  set: (val) => (state.liked = val)
})

// Play / Pause
const btnPlay = () => {
  store.dispatch('track/clickedPlay', { trackIndex: props.trackIndex, track: props.getTrack })
}

const btnPause = () => {
  if (getAudioElement.value) {
    getAudioElement.value.pause()
    store.commit('track/SET_IS_PLAYING', false)
  }
}

// Like / Unlike
const like = () => {
  if (!authenticated.value) return router.replace({ name: 'Login' })
  if (state.liked) {
    store.dispatch('track/clickedUnlike', props.getTrack.id).then(() => {
      store.dispatch('auth/initUser')
      checkLiked()
      state.liked = false
    })
  } else {
    store.dispatch('track/clickedLike', props.getTrack.id).then(() => {
      store.dispatch('auth/initUser')
      checkLiked()
      state.liked = true
    })
  }
}

const checkLiked = () => {
  if (authenticated.value && user.value.likes) {
    state.liked = user.value.likes.some(e => e.track.id === props.getTrack.id)
  }
}

// Add to playlist
const addToPlaylist = () => {
  if (!authenticated.value) return router.replace({ name: 'Login' })
  alert('Clicked: Add To Playlist')
}

onMounted(() => {
  checkLiked()
})

</script>

<style scoped lang="scss">
.height-25 {
  height: 25%;
}
</style>