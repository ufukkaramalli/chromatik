// src/staticLazyLoads.js  (ismi böyleyse bunu kullan; yoksa mevcut dosya adını koru)

// Router kayıtlarında kullanmak için:
export const Navigation  = () => import('@/components/Navigation.vue')
export const TopNav      = () => import('@/components/TopNav.vue')
export const SystemBar   = () => import('@/components/SystemBar.vue')
export const BottomPlayer= () => import('@/components/BottomPlayer.vue')
