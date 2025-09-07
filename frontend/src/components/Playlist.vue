<template>
  <!-- START: MINI PLAYER COMPONENT -->
  <v-row>
    <template v-if="tracks && tracks.length">
      <v-col
        cols="12"
        class="text-h5 font-weight-bold text-uppercase py-0 mt-1 d-flex align-center"
      >
        <slot name="title"></slot>
        <v-divider class="mx-2" vertical></v-divider>
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
          <BoxPlayer
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
        class="d-flex align-center justify-center text-h5 text-uppercase py-0 mt-1"
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

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import BoxPlayer from './Audio/BoxPlayer.vue'

const props = defineProps({
  tracks: {
    type: Array,
    required: true
  }
})

const store = useStore()

const getCurrentTrack = computed(() => store.getters['track/GET_CURRENT_TRACK'])
const getPlaying = computed(() => store.getters['track/GET_PLAYING'])
const getIsLoading = computed(() => store.getters['track/GET_IS_LOADING'])

const eventFromBoxPlayer = () => {
  store.commit('track/SET_CURRENT_PLAYLIST', props.tracks)
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