import { defineStore } from 'pinia'
import { api } from '@/lib/axios'
import { i18n } from '@/i18n'

export interface AuthUser {
  _id: string
  slug: string
  name?: string
  email?: string
  avatar?: string
  role?: string
  language?: string
  [key: string]: unknown
}

export interface UserSettings {
  language?: string
  [key: string]: unknown
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null
  }),

  getters: {
    authenticated: (s): boolean => Boolean(s.token && s.user),
    user$: (s): AuthUser | null => s.user
  },

  actions: {
    _setToken(token: string | null) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
        api.defaults.headers.common.Authorization = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
      }
    },

    _setUser(data: AuthUser | null) {
      this.user = data
      if (data?.language) {
        const globalLocale = i18n.global.locale as unknown
        if (typeof globalLocale === 'string') {
          (i18n.global as any).locale = data.language
        } else if (globalLocale && typeof globalLocale === 'object' && 'value' in globalLocale) {
          (globalLocale as { value: string }).value = data.language
        }
        localStorage.setItem('locale', data.language)
      }
    },

    async updateSettings(settings: UserSettings) {
      const res = await api.put('/user/settings', settings)
      this._setUser(res.data.user)
      return res
    },

    async logIn(credentials: Record<string, unknown>) {
      const res = await api.post('/user/login', credentials)
      return this.attempt(res.data.token)
    },

    async attempt(token?: string | null) {
      if (token) this._setToken(token)
      if (!this.token) return
      try {
        const res = await api.get('/user')
        this._setUser(res.data.user)
      } catch {
        this._setToken(null)
        this._setUser(null)
      }
    },

    async initUser() {
      const res = await api.get('/user')
      this._setUser(res.data.user)
      return res
    },

    async logOut() {
      try {
        await api.post('/user/logout')
      } catch {}
      this._setToken(null)
      this._setUser(null)
    }
  }
})
