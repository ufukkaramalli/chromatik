// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { i18n } from './i18n'
import router from './router'
import JsonViewer from 'vue-json-viewer'
import VueResizeText from 'vue-resize-text'
import '@/scss/main.scss'
import '@mdi/font/css/materialdesignicons.css'

// Pinia
import { pinia } from '@/stores'

import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import { formatCompactNumber } from '@/utils/format'
import GlassTooltip from '@/components/GlassTooltip.vue'

const app = createApp(App)
app.component('GlassTooltip', GlassTooltip)
app.config.globalProperties.$api = api
app.config.globalProperties.$formatCompactNumber = formatCompactNumber

app
  .use(pinia)
  .use(vuetify)
  .use(i18n)

// İlk açılışta token varsa oturum dene
const auth = useAuthStore()
auth.attempt(localStorage.getItem('token'))
  .catch(() => {})
  .finally(() => {
    app.use(router)
    app.use(JsonViewer)
    app.use(VueResizeText)
    app.mount('#app')
  })
