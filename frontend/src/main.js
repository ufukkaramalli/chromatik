// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { i18n } from './i18n'
import router from './router'
import store from './store'
import JsonViewer from 'vue-json-viewer'
import VueResizeText from 'vue-resize-text'
import '@/scss/main.scss'
import '@mdi/font/css/materialdesignicons.css'
import '@/store/subscriber'

// ✅ Yeni: tek yerde axios instance kullanacağız
import { api } from '@/lib/axios'

// NOT: axios.defaults.baseURL kullanmıyoruz artık.
// baseURL mantığı lib/axios içinde yönetiliyor.

const app = createApp(App)
app.config.globalProperties.$api = api // (opsiyonel) this.$api ile kullanmak istersen

app
  .use(vuetify)
  .use(i18n)
  .use(router)
  .use(store)
  .use(JsonViewer)
  .use(VueResizeText)

// auth attempt aynı kalabilir
store.dispatch('auth/attempt', localStorage.getItem('token'))
  .catch(() => {})
  .finally(() => app.mount('#app'))