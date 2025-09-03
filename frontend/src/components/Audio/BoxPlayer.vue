<template>
    <v-hover>
      <template v-slot="{ hover }">
        <v-card color="secondary darken-1" :elevation="hover ? 6 : 2" class="mx-auto" rounded="lg" dark v-ripple="{ class: `white--text`,center: true }" :loading="currentTrack && getIsLoading">
          <template v-slot:progress>
                <v-progress-linear absolute indeterminate color="primary darken-2"></v-progress-linear>
          </template>
          <v-img :src="getTrack.art" :lazy-src="getTrack.art" aspect-ratio="1" loading :gradient="hover || currentTrack ? grad : ''">
            <v-fade-transition>
              <v-overlay v-if="hover || currentTrack" absolute color="primary darken-4" class="d-flex align-center text-center" style="width:100%;">
                <v-icon @click="addToPlaylist">mdi-playlist-plus</v-icon>
                <v-col cols="12" class="d-flex justify-center" >
                  <v-btn v-if="!isPlaying" :loading="currentTrack && getIsLoading" @click="btnPlay" class="mx-2" fab dark large :color="btnColor">
                      <v-icon dark>mdi-play</v-icon>
                  </v-btn>
                  <v-btn v-else :loading="currentTrack && getIsLoading" @click="btnPause" class="mx-2" fab dark large :color="btnColor">
                      <v-icon dark >mdi-pause</v-icon>
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
          <div ref="title" class="text-truncate text-wrap text-left py-1 pb-0 pt-0 px-2 mt-1 text-uppercase font-weight-black body-1">
            <router-link :title="getTrack.name" class="routerLink" :to="{name: 'TrackPage', params: { userSlug: getTrack.user.slug, trackSlug: getTrack.slug, track: getTrack }}">{{getTrack.name | uppercase}}</router-link>
          </div>
          <v-card-text ref="artist" class="text-truncate text-wrap text-left py-1 pt-0 px-2 text-uppercase mt-n2">
            <router-link :title="getTrack.user.name" class="routerLink" :to="getTrack.user.slug">{{getTrack.user.name | uppercase}}</router-link>
          </v-card-text>
        </v-card>
      </template>
    </v-hover>
</template>
<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
Vue.prototype.window = window.window
export default {
  name: 'boxPlayer',
  props: ['get-track', 'current-track', 'is-playing', 'btn-color', 'track-index'],
  data: function () {
    return {
      grad: 'to bottom, rgba(171, 41, 41, 0.4) 45%, rgba(0, 0, 0, 0.8) 100%',
      likedTrack: '',
      liked: false

    }
  },
  created () {
    this.isThisLiked()
  },
  methods: {
    ...mapActions({
      clickedPlay: 'track/clickedPlay',
      clickedLike: 'track/clickedLike',
      clickedUnlike: 'track/clickedUnlike',
      initUser: 'auth/initUser'
    }),
    btnPlay: function () {
      this.clickedPlay({ trackIndex: this.trackIndex, track: this.getTrack })
      this.$emit('clickedTrack', 'setPlaylist')
    },
    btnPause: function () {
      this.getAudioElement.pause()
      this.$store.commit('track/SET_IS_PLAYING', false)
    },
    like: function () {
      if (this.authenticated) {
        if (this.liked) {
          this.clickedUnlike(this.getTrack.id).then(() => {
            this.initUser()
            this.isThisLiked()
            this.isLiked = false
          })
        } else {
          this.clickedLike(this.getTrack.id).then(() => {
            this.initUser()
            this.isThisLiked()
            this.isLiked = true
          })
        }
      } else {
        this.$router.replace({
          name: 'Login'
        })
      }
    },
    isThisLiked () {
      if (this.authenticated) {
        this.user.likes.forEach(element => {
          if (element.track.id === this.getTrack.id) {
            this.likedTrack = element.track
            this.isLiked = true
          }
        })
      }
    },
    addToPlaylist () {
      if (this.authenticated) {
        alert('Clicked: Add To Playlist')
      } else {
        this.$router.replace({
          name: 'Login'
        })
      }
    }
  },
  computed: {
    ...mapGetters({
      getCurrentTrack: 'track/GET_CURRENT_TRACK',
      getAudioElement: 'track/GET_AUDIO_ELEMENT',
      getAudioContext: 'track/GET_AUDIO_CONTEXT',
      getPlaying: 'track/GET_PLAYING',
      getIsLoading: 'track/GET_IS_LOADING',
      user: 'auth/user',
      authenticated: 'auth/authenticated'
    }),
    isLiked: {
      get: function () {
        return this.liked
      },
      set: function (newValue) {
        this.liked = newValue
      }
    }
  },
  filters: {
    uppercase: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.toUpperCase()
    }
  }
}
</script>
<style lang="scss" scoped>
.height-25{
    height: 25%;
}
</style>
