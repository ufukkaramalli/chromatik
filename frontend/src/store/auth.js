import { api } from '@/lib/axios'

export default {
  namespaced: true,
  state: () => ({
    token: null,
    user: null
  }),
  getters: {
    authenticated: (state) => !!state.token && !!state.user,
    user: (state) => state.user
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_USER(state, data) {
      state.user = data
    }
  },
  actions: {
    async logIn({ dispatch }, credentials) {
      const res = await api.post('/user/login', credentials)
      return dispatch('attempt', res.data.token)
    },
    async attempt({ commit, state }, token) {
      if (token) commit('SET_TOKEN', token)
      if (!state.token) return
      try {
        const res = await api.get('/user')
        commit('SET_USER', res.data)
      } catch (e) {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      }
    },
    async initUser({ commit }) {
      const res = await api.get('/auth/me')
      commit('SET_USER', res.data)
    },
    async logOut({ commit }) {
      await api.post('/auth/signout')
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    }
  }
}