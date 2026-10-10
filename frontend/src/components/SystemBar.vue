<template>
  <v-system-bar window app color="primary" class="darken-4">
    <v-spacer />

    <v-btn
      rounded="0"
      color="white"
      variant="text"
      size="small"
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
      size="small"
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
.lang-btn.active-lang:disabled,
.lang-btn.active-lang.v-btn--disabled {
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