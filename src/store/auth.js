import axios from 'axios'
export default {
  namespaced: true,

  state: {
    token: null,
    user: null
  },
  getters: {
    authenticated (state) {
      return state.token && state.user
    },
    user (state) {
      return state.user
    }
  },
  mutations: {
    SET_TOKEN (state, token) {
      state.token = token
    },
    SET_USER (state, data) {
      state.user = data
    }
  },
  actions: {
    async logIn ({ dispatch }, credentials) {
      var response = await axios.post('auth/signin', credentials)
      return dispatch('attempt', response.data.token)
    },
    async attempt ({ commit, state }, token) {
      if (token) {
        commit('SET_TOKEN', token)
      }
      if (!state.token) {
        return
      }
      try {
        var response = await axios.get('auth/me')
        commit('SET_USER', response.data)
      } catch (e) {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      }
    },
    async initUser ({ commit }) {
      var response = await axios.get('auth/me')
      commit('SET_USER', response.data)
    },
    logOut ({ commit }) {
      return axios.post('auth/signout').then(() => {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      })
    }
  }
}
