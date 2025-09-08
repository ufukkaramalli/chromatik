import store from '@/store'
import { i18n } from '@/i18n'
import { api } from '@/lib/axios'   // ⬅️ axios yerine instance

store.subscribe((mutation) => {
  switch (mutation.type) {
    // Token değiştiğinde
    case 'auth/SET_TOKEN':
      if (mutation.payload) {
        api.defaults.headers.common.Authorization = 'Bearer ' + mutation.payload
        localStorage.setItem('token', mutation.payload)
      } else {
        delete api.defaults.headers.common.Authorization
        localStorage.removeItem('token')
      }
      break

    case 'track/SET_IS_PLAYING':
      // not: burada store'a erişmeyelim; mutation payload'ını kullanmak daha güvenli
      // track modülündeki getter'a erişmek için store.getters kullanımı kalabilir.
      if (mutation.payload === true && store.getters['track/GET_BOTTOM_PLAYER'] !== true) {
        store.commit('track/SET_BOTTOM_PLAYER', true)
      }
      break

    case 'auth/SET_USER':
      if (mutation.payload && mutation.payload.language) {
        i18n.global.locale = mutation.payload.language
      }
      break
  }
})
