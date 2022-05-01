import Vue from 'vue'
import Vuex from 'vuex'
import auth from './auth'
import track from './track'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    themeOpts: {
      topnav: true,
      navigation: false,
      systemBar: true
    },
    loginOverlay: false,
    appName: process.env.VUE_APP_APPLICATION_NAME,
    RecentTracks: null,
    MostLiked: null,
    MostStreamed: null
  },
  getters: {
    getTopNav: state => {
      return state.themeOpts.topnav
    },
    getNavigation: state => {
      return state.themeOpts.navigation
    },
    getSystemBar: state => {
      return state.themeOpts.systemBar
    },
    getLoginOverlay: state => {
      return state.loginOverlay
    },
    getAppName: state => {
      return state.appName
    },
    GET_RECENT_TRACKS: state => {
      return state.RecentTracks
    },
    GET_MOST_LIKED_TRACKS: state => {
      return state.MostLiked
    },
    GET_MOST_STREAMED_TRACKS: state => {
      return state.MostStreamed
    }
  },
  mutations: {
    setTopNav (state, value) {
      state.themeOpts.topnav = value
    },
    setNavigation (state, value) {
      state.themeOpts.navigation = !value
    },
    setSystemBar (state, value) {
      state.themeOpts.systemBar = value
    },
    setLoginOverlay (state, value) {
      state.loginOverlay = value
    },
    SET_RECENT_TRACKS (state, value) {
      state.RecentTracks = value
    },
    SET_MOST_LIKED_TRACKS (state, value) {
      state.MostLiked = value
    },
    SET_MOST_STREAMED_TRACKS (state, value) {
      state.MostStreamed = value
    }
  },
  actions: {
    async RECENT_TRACKS ({ commit }) {
      var response = await axios.get('track/recent', {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      if (response) {
        commit('SET_RECENT_TRACKS', response.data.tracks)
      } else {
        console.log('NOT COMMITTED')
      }
    },
    async MOST_LIKED ({ commit }) {
      var response = await axios.get('track/mostlike', {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      if (response) {
        commit('SET_MOST_LIKED_TRACKS', response.data.MostLiked)
      } else {
        console.log('NOT COMMITTED')
      }
    },
    async MOST_STREAMED ({ commit }) {
      var response = await axios.get('track/moststreamed', {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      if (response) {
        commit('SET_MOST_STREAMED_TRACKS', response.data.MostStreamed)
      } else {
        console.log('NOT COMMITTED')
      }
    },
    async GET_TRACK_PAGE ({ commit }, payload) {
      var response = await axios.post('track/find-track', { data: payload }, {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      if (response) {
        return response
      } else {
        console.log('NOT COMMITTED')
      }
    }
  },
  modules: {
    auth,
    track
  }
})
