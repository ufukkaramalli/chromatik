import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import router from './router'
import store from './store'
import axios from 'axios'
import JsonViewer from 'vue-json-viewer'
// import VueSocketIO from 'vue-socket.io'
import VueResizeText from 'vue-resize-text'
// import VueWindowSize from 'vue-window-size'

// Vue.use(VueWindowSize)
// Vue.use(new VueSocketIO({
//   connection: process.env.VUE_APP_SOCKET_INSTANCE
// }))
Vue.use(JsonViewer)
Vue.use(VueResizeText)

require('@/store/subscriber')

if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = process.env.VUE_APP_API_ADDRESS
  // console.log('Axios Production Base Url: ', axios.defaults.baseURL)
} else if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = process.env.VUE_APP_LOCAL_API_ADDRESS
  // console.log('Axios Development Base Url: ', axios.defaults.baseURL)
  // console.log(process.env)
}

Vue.config.productionTip = false

store.dispatch('auth/attempt', localStorage.getItem('token')).then(() => {
  new Vue({
    vuetify,
    i18n,
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
