// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { i18n } from './i18n'
import router from './router'
import JsonViewer from 'vue-json-viewer'
import VueResizeText from 'vue-resize-text'
import '@/scss/main.scss'
import '@mdi/font/css/materialdesignicons.css'

// ❌ Vuex ve subscriber artık yok
// import store from './store'
// import '@/store/subscriber'

// ✅ Pinia
import { pinia } from '@/stores'

// ✅ Ortak axios instance
import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
app.config.globalProperties.$api = api // (opsiyonel)

app
  .use(pinia)
  .use(vuetify)
  .use(i18n)
  .use(router)
  .use(JsonViewer)
  .use(VueResizeText)

// İlk açılışta token varsa oturum dene
const auth = useAuthStore()
auth.attempt(localStorage.getItem('token'))
  .catch(() => {})
  .finally(() => app.mount('#app'))