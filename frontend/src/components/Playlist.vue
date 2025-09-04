<template>
  <!-- START: MINI PLAYER COMPONENT -->
  <v-row>
    <template v-if="tracks">
      <v-col
        cols="12"
        class="display-2 font-weight-black text-uppercase py-0 mt-1 d-flex align-center"
      >
        <slot name="title"></slot>
        <v-divider class="mx-2" vertical inset></v-divider>
        <slot name="subtitle"></slot>
      </v-col>

      <v-col cols="12" class="py-0">
        <v-divider class="mt-1 mb-3"></v-divider>
      </v-col>

      <v-col
        v-for="(track, index) in tracks"
        :key="track.id"
        class="d-flex child-flex flex-wrap"
        cols="6"
        sm="4"
        md="4"
        lg="2"
      >
        <transition name="slide-fade" appear>
          <box-player
            :track-index="index"
            btn-color="primary"
            :get-track="track"
            @clickedTrack="eventFromBoxPlayer"
            v-bind="$attrs"
            :current-track="getCurrentTrack === track"
            :is-playing="getPlaying && getCurrentTrack === track"
          />
        </transition>
      </v-col>
    </template>

    <template v-else>
      <v-col
        cols="12"
        class="d-flex align-center justify-center display-2 text-uppercase py-0 mt-1"
      >
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
import { computed } from 'vue'
import { useStore } from 'vuex'
import BoxPlayer from './Audio/BoxPlayer.vue'

export default {
  name: 'Playlist',
  components: {
    BoxPlayer
  },
  props: {
    tracks: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const store = useStore()

    const getCurrentTrack = computed(() => store.getters['track/GET_CURRENT_TRACK'])
    const getPlaying = computed(() => store.getters['track/GET_PLAYING'])
    const getIsLoading = computed(() => store.getters['track/GET_IS_LOADING'])

    const eventFromBoxPlayer = () => {
      store.commit('track/SET_CURRENT_PLAYLIST', props.tracks)
    }

    return {
      getCurrentTrack,
      getPlaying,
      getIsLoading,
      eventFromBoxPlayer
    }
  }
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}
</style>