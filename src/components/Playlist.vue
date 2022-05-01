<template>
 <!-- START: MINI PLAYER COMPONENT -->
<v-row>
  <template v-if="tracks">
      <v-col cols="12 display-2 font-weight-black text-uppercase py-0 mt-1 d-flex align-center">
        <slot name="title"></slot>
        <v-divider class="mx-2" vertical inset></v-divider>
        <slot name="subtitle"></slot>
      </v-col>
      <v-col cols="12" class="py-0">
        <v-divider class="mt-1 mb-3"></v-divider>
      </v-col>
      <v-col v-for="(track, index) in tracks" :key="track.id" class="d-flex child-flex flex-wrap" cols="6" sm="4" md="4" lg="2">
        <transition name="slide-fade" appear>
        <box-player
          :track-index="index"
          :btn-color="'primary'"
          :get-track="track"
          @clickedTrack="eventFromBoxPlayer"
          v-on="$listeners"
          :current-track="getCurrentTrack == track"
          :is-playing="getPlaying && getCurrentTrack == track"
        >
        </box-player>
        </transition>
      </v-col>
  </template>
  <template v-else>
    <v-col cols="12" class="d-flex align-center justify-center display-2 text-uppercase py-0 mt-1">
      <v-progress-circular
      :size="60"
      :width="6"
      color="primary"
      indeterminate
    ></v-progress-circular>
    </v-col>
  </template>
</v-row>
    <!-- END: MINI PLAYER COMPONENT -->
</template>
<script>
import { mapGetters } from 'vuex'
import boxPlayer from './Audio/BoxPlayer.vue'
export default {
  name: 'Playlist',
  props: ['tracks'],
  components: {
    boxPlayer
  },
  data: function () {
    return {
      trackLoading: false
    }
  },
  methods: {
    eventFromBoxPlayer: function () {
      this.$store.commit('track/SET_CURRENT_PLAYLIST', this.tracks)
    }
  },
  computed: {
    ...mapGetters({
      getCurrentTrack: 'track/GET_CURRENT_TRACK',
      getPlaying: 'track/GET_PLAYING',
      getIsLoading: 'track/GET_IS_LOADING'
    })
  }
}
</script>
<style scoped>
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translatey(-30px);
  opacity: 0;
}
</style>
