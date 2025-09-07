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
@use '@/scss/main.scss' as *;
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
    $route(to, from) {
      document.title = to.meta?.title || 'Chromatique'
      this.transitionName =
        this.transitionName === 'slide-left' ? 'slide-right' : 'slide-left'
    },
    getAudioElement: {
      immediate: true,
      handler(newEl, oldEl) {
        if (!newEl) return

        // Öncekileri temizle
        if (oldEl) {
          oldEl.replaceWith(oldEl.cloneNode(true))
        }

        newEl.addEventListener('play', () => {
          store.commit('track/SET_IS_PLAYING', true)
        })

        newEl.addEventListener('pause', () => {
          store.commit('track/SET_IS_PLAYING', false)
        })

        newEl.addEventListener('waiting', () => {
          // buffer loading
        })

        newEl.addEventListener('timeupdate', () => {
          store.commit(
            'track/SET_CURRENT_TIME',
            this.sToTime(newEl.currentTime)
          )
        })

        newEl.addEventListener('ended', () => {
          store.dispatch('track/SET_NEXT_TRACK')
        })
      }
    }
  },
  methods: {
    padZero(v) {
      return v < 10 ? '0' + v : v
    },
    sToTime(t) {
      return (
        this.padZero(parseInt((t / 60) % 60)) +
        ':' +
        this.padZero(parseInt(t % 60))
      )
    }
  }
}
</script>