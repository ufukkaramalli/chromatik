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

// Subscriber
require('@/store/subscriber')

// Axios baseURL ayarları
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = process.env.VUE_APP_API_ADDRESS
} else if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = process.env.VUE_APP_LOCAL_API_ADDRESS
}

// Vue 3 createApp
const app = createApp(App)

// Pluginleri ekle
app.use(vuetify)
app.use(i18n)
app.use(router)
app.use(store)
app.use(JsonViewer)
app.use(VueResizeText)

// Auth kontrolü
store.dispatch('auth/attempt', localStorage.getItem('token')).then(() => {
  app.mount('#app')
})
