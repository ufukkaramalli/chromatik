<template>
  <v-hover>
    <template v-slot="{ hover }">
      <v-card
        color="secondary darken-1"
        :elevation="hover ? 6 : 2"
        class="mx-auto"
        rounded="lg"
        dark
        v-ripple="{ class: `white--text`, center: true }"
        :loading="currentTrack && getIsLoading"
      >
        <template v-slot:progress>
          <v-progress-linear absolute indeterminate color="primary darken-2"></v-progress-linear>
        </template>

        <v-img
          :src="getTrack.art"
          :lazy-src="getTrack.art"
          aspect-ratio="1"
          loading
          :gradient="hover || currentTrack ? grad : ''"
        >
          <v-fade-transition>
            <v-overlay
              v-if="hover || currentTrack"
              absolute
              color="primary darken-4"
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
                  dark
                  large
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
                  dark
                  large
                  :color="btnColor"
                >
                  <v-icon dark>mdi-pause</v-icon>
                </v-btn>
              </v-col>

              <template v-if="user">
                <v-icon @click="like">{{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
              </template>
              <template v-else>
                <v-icon @click="like">mdi-heart-outline</v-icon>
              </template>
            </v-overlay>
          </v-fade-transition>

          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="primary darken-2"></v-progress-circular>
            </v-row>
          </template>
        </v-img>

        <div
          ref="title"
          class="text-truncate text-wrap text-left py-1 pb-0 pt-0 px-2 mt-1 text-uppercase font-weight-black body-1"
        >
          <router-link
            :title="getTrack.name"
            class="routerLink"
            :to="{ name: 'TrackPage', params: { userSlug: getTrack.user.slug, trackSlug: getTrack.slug, track: getTrack } }"
          >
            {{ getTrack.name.toUpperCase() }}
          </router-link>
        </div>

        <v-card-text
          ref="artist"
          class="text-truncate text-wrap text-left py-1 pt-0 px-2 text-uppercase mt-n2"
        >
          <router-link :title="getTrack.user.name" class="routerLink" :to="getTrack.user.slug">
            {{ getTrack.user.name.toUpperCase() }}
          </router-link>
        </v-card-text>
      </v-card>
    </template>
  </v-hover>
</template>

<script>
import { computed, reactive, toRefs, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'BoxPlayer',
  props: {
    getTrack: { type: Object, required: true },
    currentTrack: { type: Object },
    isPlaying: { type: Boolean, default: false },
    btnColor: { type: String, default: 'primary' },
    trackIndex: { type: Number }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()

    const state = reactive({
      grad: 'to bottom, rgba(171, 41, 41, 0.4) 45%, rgba(0, 0, 0, 0.8) 100%',
      liked: false,
      likedTrack: ''
    })

    const user = computed(() => store.getters['auth/user'])
    const authenticated = computed(() => store.getters['auth/authenticated'])
    const getIsLoading = computed(() => store.getters['track/GET_IS_LOADING'])
    const getAudioElement = computed(() => store.getters['track/GET_AUDIO_ELEMENT'])

    const isLiked = computed({
      get: () => state.liked,
      set: (val) => (state.liked = val)
    })

    const btnPlay = () => {
      store.dispatch('track/clickedPlay', { trackIndex: props.trackIndex, track: props.getTrack })
      // Emit event to parent if needed
    }

    const btnPause = () => {
      getAudioElement.value.pause()
      store.commit('track/SET_IS_PLAYING', false)
    }

    const like = () => {
      if (authenticated.value) {
        if (state.liked) {
          store.dispatch('track/clickedUnlike', props.getTrack.id).then(() => {
            store.dispatch('auth/initUser')
            isThisLiked()
            state.liked = false
          })
        } else {
          store.dispatch('track/clickedLike', props.getTrack.id).then(() => {
            store.dispatch('auth/initUser')
            isThisLiked()
            state.liked = true
          })
        }
      } else {
        router.replace({ name: 'Login' })
      }
    }

    const isThisLiked = () => {
      if (authenticated.value) {
        user.value.likes.forEach((element) => {
          if (element.track.id === props.getTrack.id) {
            state.likedTrack = element.track
            state.liked = true
          }
        })
      }
    }

    const addToPlaylist = () => {
      if (authenticated.value) {
        alert('Clicked: Add To Playlist')
      } else {
        router.replace({ name: 'Login' })
      }
    }

    onMounted(() => {
      isThisLiked()
    })

    return {
      ...toRefs(state),
      user,
      authenticated,
      getIsLoading,
      getAudioElement,
      isLiked,
      btnPlay,
      btnPause,
      like,
      addToPlaylist
    }
  }
}
</script>

<style scoped lang="scss">
.height-25 {
  height: 25%;
}
</style>