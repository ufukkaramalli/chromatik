import store from '@/store'
import { i18n } from '@/i18n'
import axios from 'axios'

store.subscribe((mutation, state) => {
  switch (mutation.type) {

    // Token değiştiğinde
    case 'auth/SET_TOKEN':
      if (mutation.payload) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + mutation.payload
        localStorage.setItem('token', mutation.payload)
      } else {
        delete axios.defaults.headers.common['Authorization']
        localStorage.removeItem('token')
      }
      break

    // Track play durumu
    case 'track/SET_IS_PLAYING':
      if (mutation.payload === true && store.getters.GET_BOTTOM_PLAYER !== true) {
        store.commit('track/SET_BOTTOM_PLAYER', true)
      }
      break

    // Kullanıcı bilgisi değiştiğinde dil ayarla
    case 'auth/SET_USER':
      if (mutation.payload && mutation.payload.language) {
        i18n.locale = mutation.payload.language
      }
      break

  }
})