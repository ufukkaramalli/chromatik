import { defineStore } from 'pinia'
import { api } from '@/lib/axios'
import { i18n } from '@/i18n' // kullanıcı dili gelirse güncellemek istersen

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null
  }),

  getters: {
    authenticated: (s) => !!s.token && !!s.user,
    user$: (s) => s.user
  },

  actions: {
    _setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
        api.defaults.headers.common.Authorization = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
      }
    },

    _setUser(data) {
      this.user = data
      if (data?.language) {
        if (typeof i18n.global.locale === 'string') {
          i18n.global.locale = data.language
        } else {
          i18n.global.locale.value = data.language
        }
        localStorage.setItem('locale', data.language)
      }
    },

    async updateSettings(settings) {
      const res = await api.put('/user/settings', settings)
      this._setUser(res.data.user)
      return res
    },

    async logIn(credentials) {
      const res = await api.post('/user/login', credentials)
      return this.attempt(res.data.token)
    },

    async attempt(token) {
      if (token) this._setToken(token)
      if (!this.token) return
      try {
        const res = await api.get('/user')
        this._setUser(res.data.user)
      } catch (e) {
        this._setToken(null)
        this._setUser(null)
        // Hata üst katmana gerekiyorsa fırlatabilirsin:
        // throw e
      }
    },

    async initUser() {
      const res = await api.get('/user')
      this._setUser(res.data.user)
      return res
    },

    async logOut() {
      try { await api.post('/user/logout') } catch {}
      this._setToken(null)
      this._setUser(null)
    }
  }
})