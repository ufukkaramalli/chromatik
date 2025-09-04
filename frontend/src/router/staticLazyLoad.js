// src/StaticLazyLoad.js
import { defineAsyncComponent } from 'vue'

export const Navigation = defineAsyncComponent(() =>
  import('@/components/Navigation.vue')
)

export const TopNav = defineAsyncComponent(() =>
  import('@/components/TopNav.vue')
)

export const SystemBar = defineAsyncComponent(() =>
  import('@/components/SystemBar.vue')
)

export const BottomPlayer = defineAsyncComponent(() =>
  import('@/components/BottomPlayer.vue')
)