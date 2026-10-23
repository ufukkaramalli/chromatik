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
      <router-view name="Footer" />
    </div>

    <router-view name="BottomPlayer" />
    <CartDrawer />
  </v-app>
</template>

<style lang="scss">
@use '@/scss/main.scss' as *;
</style>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CartDrawer from '@/components/Cart/CartDrawer.vue'
import { useCartStore } from '@/stores/cartStore'

const transitionName = ref('slide-left')
const route = useRoute()
const cartStore = useCartStore()

onMounted(() => {
  cartStore.initCart()
})


// sayfa başlığı ve geçiş animasyonu
watch(
  () => route.fullPath,
  () => {
    if (!route.meta?.dynamicTitle) {
      const title = typeof route.meta?.title === 'function' ? route.meta.title(route) : route.meta?.title
      document.title = title || 'CHROMATIK'
    }
    transitionName.value =
      transitionName.value === 'slide-left' ? 'slide-right' : 'slide-left'
  }
)

// Setup Media Session and Keyboard Shortcuts for the entire app scope
import { useMediaSession } from '@/composables/useMediaSession'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useI18n } from 'vue-i18n'

useMediaSession()
useKeyboardShortcuts()

const { locale } = useI18n()
watch(locale, (newLang) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = newLang
  }
}, { immediate: true })
</script>