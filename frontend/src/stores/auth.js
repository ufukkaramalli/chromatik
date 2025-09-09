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
      // opsiyonel: backend user.language dönerse i18n güncelle
      if (data?.language) {
        i18n.global.locale = data.language
      }
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
        this._setUser(res.data)
      } catch (e) {
        this._setToken(null)
        this._setUser(null)
        // Hata üst katmana gerekiyorsa fırlatabilirsin:
        // throw e
      }
    },

    async initUser() {
      const res = await api.get('/auth/me')
      this._setUser(res.data)
      return res
    },

    async logOut() {
      try { await api.post('/auth/signout') } catch {}
      this._setToken(null)
      this._setUser(null)
    }
  }
})