<template>
    <v-footer v-if="getBottomPlayer" app fixed padless inset>
        <v-card width="100%" height="100%" tile>
            <v-progress-linear
                :buffer-value="BufferSize"
                stream
                :value="currentTime / getAudioElement.duration * 100"
                class="my-0"
                height="5"
            ></v-progress-linear>
            <v-row class="px-6">
                <v-col cols="4" class="d-flex flex-row py-1">
                    <v-col class="flex-grow-0">
                        <v-img :aspect-ratio="1" width="74" :src="getCurrentTrack.art !== null ? getCurrentTrack.art : ''" class="rounded-lg">
                        </v-img>
                    </v-col>
                    <v-col class="flex-grow-1 d-flex flex-column pl-0 justify-center">
                        <div class="text-uppercase font-weight-black body-1"><router-link :title="getCurrentTrack.name" class="routerLink" :to="{name: 'TrackPage', params: { user: getCurrentTrack.user.slug, track: getCurrentTrack.name }}">{{getCurrentTrack.name}}</router-link></div>
                        <div class="text-uppercase body-1"><router-link class="routerLink" :to="getCurrentTrack.user.slug">{{getCurrentTrack.user.name}}</router-link></div>
                    </v-col>
                </v-col>
                <v-col cols="4" class="d-flex align-center justify-center">
                    <div class="d-flex align-center">
                        <v-btn class="mx-2" @click="previousTrack" @dblclick.prevent fab small icon>
                            <v-icon>mdi-rewind</v-icon>
                        </v-btn>
                        <v-btn outlined class="mx-2 scale" fab icon v-if="!getPlaying" @click="btnPlay">
                            <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <v-btn outlined class="mx-2" fab icon @click="btnPause" v-else>
                            <v-icon>mdi-pause</v-icon>
                        </v-btn>
                        <v-btn class="mx-2" @click="nextTrack" @dblclick.prevent fab small icon>
                            <v-icon>mdi-fast-forward</v-icon>
                        </v-btn>
                    </div>
                </v-col>
                <v-col cols="4" class="d-flex align-center justify-end">
                    <v-col cols="5">
                        <v-slider hide-details v-model="gainSlider" prepend-icon="mdi-volume-source"></v-slider>
                    </v-col>
                </v-col>
            </v-row>
        </v-card>
    </v-footer>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'BottomPlayer',
  data () {
    return {
      buffer: 0,
      currentTime: 0
    }
  },
  computed: {
    ...mapGetters({
      getCurrentTrack: 'track/GET_CURRENT_TRACK',
      getCurrentPlaylist: 'track/GET_CURRENT_PLAYLIST',
      getAudioElement: 'track/GET_AUDIO_ELEMENT',
      getAudioContext: 'track/GET_AUDIO_CONTEXT',
      getCurrentTime: 'track/GET_CURRENT_TIME',
      getGain: 'track/GET_GAIN',
      getPlaying: 'track/GET_PLAYING',
      getIsLoading: 'track/GET_IS_LOADING',
      getBottomPlayer: 'track/GET_BOTTOM_PLAYER',
      getCurrentTrackIndex: 'track/GET_CURRENT_TRACK_INDEX',
      user: 'auth/user',
      authenticated: 'auth/authenticated'
    }),
    gainSlider: {
      get () {
        if (this.getAudioElement) {
          return this.getGain
        } else {
          return 100
        }
      },
      set (value) {
        this.$store.commit('track/SET_GAIN', parseInt(value) / parseInt(100))
      }
    },
    BufferSize: {
      get () {
        return this.buffer
      },
      set (value) {
        this.buffer = value
      }
    }
  },
  watch: {
    'getAudioElement' (to, from) {
      this.getAudioElement.addEventListener('timeupdate', (event) => {
        this.BufferSize = this.getAudioElement.buffered.length * 100
      })
    },
    'getCurrentTime' (to, from) {
      this.currentTime = this.getAudioElement.currentTime
    }
  },
  methods: {
    ...mapActions({
      nextTrack: 'track/SET_NEXT_TRACK',
      previousTrack: 'track/SET_PREVIOUS_TRACK'
    }),
    btnPlay: function () {
      this.$store.dispatch('track/clickedPlay', { trackIndex: this.getCurrentTrackIndex, track: this.getCurrentTrack })
    },
    btnPause: function () {
      this.getAudioElement.pause()
      this.$store.commit('track/SET_IS_PLAYING', false)
    }
  }
}
</script>
