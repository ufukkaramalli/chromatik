<template>
  <v-system-bar window app color="primary" class="darken-4">
    <v-spacer />

    <v-btn
      variant="text"
      size="small"
      :disabled="currentLocale === 'en'"
      @click="setLocale('en')"
    >
      EN
    </v-btn>

    <v-btn
      variant="text"
      size="small"
      :disabled="currentLocale === 'tr'"
      @click="setLocale('tr')"
    >
      TR
    </v-btn>
  </v-system-bar>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

const setLocale = (lang) => {
  locale.value = lang
}
</script>