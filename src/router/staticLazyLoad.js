export const Navigation = resolve => {
  require.ensure(['@/components/Navigation.vue'], () => {
    resolve(require('@/components/Navigation.vue'))
  })
}

export const TopNav = resolve => {
  require.ensure(['@/components/TopNav.vue'], () => {
    resolve(require('@/components/TopNav.vue'))
  })
}

export const SystemBar = resolve => {
  require.ensure(['@/components/SystemBar.vue'], () => {
    resolve(require('@/components/SystemBar.vue'))
  })
}

export const BottomPlayer = resolve => {
  require.ensure(['@/components/BottomPlayer.vue'], () => {
    resolve(require('@/components/BottomPlayer.vue'))
  })
}
