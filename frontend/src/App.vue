<template>
  <v-app>
    <router-view name="Navigation" />
    <router-view name="SystemBar" />
    <router-view name="TopNav" />

    <div class="app-gradient-bg">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <router-view name="BottomPlayer" />
  </v-app>
</template>

<style lang="scss">
@use '@/scss/main.scss' as *;
</style>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const transitionName = ref('slide-left')
const route = useRoute()


// sayfa başlığı ve geçiş animasyonu
watch(
  () => route.fullPath,
  (to, from) => {
    document.title = route.meta?.title || 'Chromatique'
    transitionName.value =
      transitionName.value === 'slide-left' ? 'slide-right' : 'slide-left'
  }
)

// Setup Media Session and Keyboard Shortcuts for the entire app scope
import { useMediaSession } from '@/composables/useMediaSession'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

useMediaSession()
useKeyboardShortcuts()
</script>