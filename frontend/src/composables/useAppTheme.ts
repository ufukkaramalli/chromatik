// src/composables/useAppTheme.ts
import { computed } from 'vue'
import { useTheme } from 'vuetify'

export type AppTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'
const DEFAULT_THEME: AppTheme = 'dark'

function updateDocumentThemeMeta(isDark: boolean) {
  if (typeof document === 'undefined') return

  // Update HTML data-theme attribute
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')

  // Update theme-color meta tag for mobile browsers and PWA chrome
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = isDark ? '#09070F' : '#F8FAFC'
}

export function useAppTheme() {
  const theme = useTheme()

  const currentTheme = computed<AppTheme>(() => {
    return (theme.global.name.value as AppTheme) || DEFAULT_THEME
  })

  const isDark = computed<boolean>(() => {
    return theme.global.current.value.dark
  })

  const setTheme = (nextTheme: AppTheme) => {
    if (typeof (theme as any).change === 'function') {
      theme.change(nextTheme)
    } else {
      theme.global.name.value = nextTheme
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }
    updateDocumentThemeMeta(nextTheme === 'dark')
  }

  const toggleTheme = () => {
    const nextTheme: AppTheme = isDark.value ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme
  }
}
