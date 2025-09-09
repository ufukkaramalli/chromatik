<template>
  <v-app>
    <router-view name="Navigation" />
    <router-view name="SystemBar" />
    <router-view name="TopNav" />

    <router-view v-slot="{ Component }">
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <router-view name="BottomPlayer" />
  </v-app>
</template>

<style lang="scss">
@use '@/scss/main.scss' as *;
</style>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTrackStore } from '@/stores/track'

const transitionName = ref('slide-left')
const route = useRoute()

// 🎵 Track store
const track = useTrackStore()
const { GET_CURRENT_TRACK, GET_AUDIO_CONTEXT, GET_AUDIO_ELEMENT } = storeToRefs(track)

// sayfa başlığı ve geçiş animasyonu
watch(
  () => route.fullPath,
  (to, from) => {
    document.title = route.meta?.title || 'Chromatique'
    transitionName.value =
      transitionName.value === 'slide-left' ? 'slide-right' : 'slide-left'
  }
)

// audio element eventleri
watch(
  GET_AUDIO_ELEMENT,
  (newEl, oldEl) => {
    if (!newEl) return

    // Öncekileri temizle
    if (oldEl) oldEl.replaceWith(oldEl.cloneNode(true))

    newEl.addEventListener('play', () => {
      track.SET_IS_PLAYING(true)
    })

    newEl.addEventListener('pause', () => {
      track.SET_IS_PLAYING(false)
    })

    newEl.addEventListener('waiting', () => {
      // buffer loading
    })

    newEl.addEventListener('timeupdate', () => {
      track.SET_CURRENT_TIME(sToTime(newEl.currentTime))
    })

    newEl.addEventListener('ended', () => {
      track.SET_NEXT_TRACK()
    })
  },
  { immediate: true }
)

// helpers
function padZero(v) {
  return v < 10 ? '0' + v : v
}
function sToTime(t) {
  return (
    padZero(parseInt((t / 60) % 60)) +
    ':' +
    padZero(parseInt(t % 60))
  )
}
</script>