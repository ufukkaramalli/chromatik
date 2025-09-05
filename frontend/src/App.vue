<template>
  <v-app>
    <router-view name="Navigation"></router-view>
    <router-view name="SystemBar"></router-view>
    <router-view name="TopNav"></router-view>
    <transition :name="transitionName" mode="out-in">
      <router-view></router-view>
    </transition>
    <router-view name="BottomPlayer"></router-view>
  </v-app>
</template>
<style lang="scss">
  @use '@/scss/main.scss' as * ;
</style>
<script>
import { mapGetters } from 'vuex'
import store from '@/store'
export default {
  name: 'App',
  data: () => ({
    transitionName: 'slide-left'
  }),
  computed: {
    ...mapGetters({
      getCurrentTrack: 'track/GET_CURRENT_TRACK',
      getAudioContext: 'track/GET_AUDIO_CONTEXT',
      getAudioElement: 'track/GET_AUDIO_ELEMENT'
    })
  },
  watch: {
    '$route' (to, from) {
      document.title = to.meta.title
      if (this.transitionName === 'slide-left') {
        this.transitionName = 'slide-right'
      } else {
        this.transitionName = 'slide-left'
      }
    },
    'getAudioElement' (to, from) {
      this.getAudioElement.addEventListener('play', function (event) {
        store.commit('track/SET_IS_PLAYING', true)
      })
      this.getAudioElement.addEventListener('pause', function (event) {
        store.commit('track/SET_IS_PLAYING', false)
      })
      this.getAudioElement.addEventListener('waiting', (event) => {
        // console.log('waiting')
      })
      this.getAudioElement.addEventListener('timeupdate', (event) => {
        function sToTime (t) {
          return padZero(parseInt((t / (60)) % 60)) + ':' + padZero(parseInt((t) % 60))
        }
        function padZero (v) {
          return (v < 10) ? '0' + v : v
        }
        store.commit('track/SET_CURRENT_TIME', sToTime(this.getAudioElement.currentTime))
      })
      this.getAudioElement.addEventListener('ended', (event) => {
        store.dispatch('track/SET_NEXT_TRACK')
      })
    }
  }
}
</script>