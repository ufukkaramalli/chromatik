// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { i18n } from './i18n'
import router from './router'
import store from './store'
import axios from 'axios'
import JsonViewer from 'vue-json-viewer'
import VueResizeText from 'vue-resize-text'
import '@/scss/main.scss'

// Use font-based Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

// Vuex subscriber: side-effect import
import '@/store/subscriber'

// Vite env: VUE_APP_* -> VITE_*
axios.defaults.baseURL = import.meta.env.DEV
  ? (import.meta.env.VITE_LOCAL_API_ADDRESS || 'http://localhost:5000/')
  : (import.meta.env.VITE_API_ADDRESS || 'https://api.example.com/')

const app = createApp(App)
app.use(vuetify).use(i18n).use(router).use(store).use(JsonViewer).use(VueResizeText)

// Always mount (auth attempt may fail gracefully)
store.dispatch('auth/attempt', localStorage.getItem('token'))
  .catch(() => {})
  .finally(() => app.mount('#app'))