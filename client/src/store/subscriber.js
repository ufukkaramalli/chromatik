import store from '@/store'
import i18n from '@/i18n'
import axios from 'axios'

store.subscribe((mutation, state) => {
  // console.log(mutation)
  switch (mutation.type) {
    case 'auth/SET_TOKEN':
      if (mutation.payload) {
        axios.defaults.headers.common.Authorization = 'Bearer ' + mutation.payload
        localStorage.setItem('token', mutation.payload)
      } else {
        axios.defaults.headers.common.Authorization = null
        localStorage.removeItem('token')
      }
      break
    case 'track/SET_IS_PLAYING':
      if (mutation.payload === true) {
        if (store.getters.GET_BOTTOM_PLAYER !== true) {
          store.commit('track/SET_BOTTOM_PLAYER', true)
        }
      }
      break
    case 'auth/SET_USER':
      if (mutation.payload) {
        i18n.locale = mutation.payload.language
      }
      break
  }
})
