<template>
  <v-system-bar app color="primary" class="red-darken-2">
    <v-spacer />

    <v-btn
      icon
      variant="text"
      size="x-small"
      color="white"
      class="theme-btn mr-1"
      :aria-label="isDark ? $t('Theme.LightMode') : $t('Theme.DarkMode')"
      @click="toggleTheme"
    >
      <v-icon size="small">
        {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
      </v-icon>
      <GlassTooltip
        :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        :text="isDark ? $t('Theme.LightMode') : $t('Theme.DarkMode')"
        location="bottom"
      />
    </v-btn>

    <v-divider vertical class="mx-1 my-1" color="white" opacity="0.3" />

    <v-btn
      rounded="0"
      color="white"
      variant="text"
      size="x-small"
      :disabled="currentLocale === 'en'"
      class="lang-btn"
      :class="{ 'active-lang': currentLocale === 'en' }"
      @click="setLocale('en')"
    >
      EN
    </v-btn>

    <v-btn
      rounded="0"
      color="white"
      variant="text"
      size="x-small"
      :disabled="currentLocale === 'tr'"
      class="lang-btn"
      :class="{ 'active-lang': currentLocale === 'tr' }"
      @click="setLocale('tr')"
    >
      TR
    </v-btn>
  </v-system-bar>
</template>

<script setup>
import { computed } from 'vue'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppTheme } from '@/composables/useAppTheme'

const { isDark, toggleTheme } = useAppTheme()
const auth = useAuthStore()
const currentLocale = computed(() => 
  typeof i18n.global.locale === 'string' ? i18n.global.locale : i18n.global.locale.value
)

const setLocale = async (lang) => {
  if (typeof i18n.global.locale === 'string') {
    i18n.global.locale = lang
  } else {
    i18n.global.locale.value = lang
  }
  localStorage.setItem('locale', lang)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
  }
  
  if (auth.authenticated) {
    try {
      await auth.updateSettings({ language: lang })
    } catch (e) {
      console.error('Failed to sync language to backend', e)
    }
  }
}
</script>

<style scoped>
.v-system-bar {
  background-color: #b71c1c !important;
  overflow: hidden;
}

.lang-btn {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 600;
  font-size: 0.72rem !important;
  height: 100% !important;
  min-height: 100% !important;
  max-height: 100% !important;
  width: 36px !important;
  min-width: 36px !important;
  padding: 0 !important;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.lang-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.15) !important;
  color: #ffffff !important;
}

.lang-btn.active-lang:disabled,
.lang-btn.active-lang.v-btn--disabled {
  background-color: #611515 !important;
  opacity: 1 !important;
  color: #ffffff !important;
  font-weight: 900 !important;
}

:deep(.lang-btn.active-lang.v-btn--disabled .v-btn__content) {
  color: #ffffff !important;
  opacity: 1 !important;
}

:deep(.lang-btn.active-lang.v-btn--disabled .v-btn__overlay) {
  opacity: 0 !important;
}
</style>