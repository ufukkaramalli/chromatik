// src/store/auth.js
import axios from 'axios'

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
      const response = await axios.post('user/login', credentials)
      console.log(response.data)
      return dispatch('attempt', response.data.token)
    },
    async attempt({ commit, state }, token) {
      if (token) commit('SET_TOKEN', token)
      if (!state.token) return
      try {
        const response = await axios.get('user')
        commit('SET_USER', response.data)
      } catch (e) {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      }
    },
    async initUser({ commit }) {
      const response = await axios.get('auth/me')
      commit('SET_USER', response.data)
    },
    logOut({ commit }) {
      return axios.post('auth/signout').then(() => {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      })
    }
  }
}