// src/store/index.js
import { createStore } from 'vuex'
import auth from './auth'
import track from './track'
import axios from 'axios'

export default createStore({
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
    getTopNav: state => state.themeOpts.topnav,
    getNavigation: state => state.themeOpts.navigation,
    getSystemBar: state => state.themeOpts.systemBar,
    getLoginOverlay: state => state.loginOverlay,
    getAppName: state => state.appName,
    GET_RECENT_TRACKS: state => state.RecentTracks,
    GET_MOST_LIKED_TRACKS: state => state.MostLiked,
    GET_MOST_STREAMED_TRACKS: state => state.MostStreamed
  },
  mutations: {
    setTopNav (state, value) {
      state.themeOpts.topnav = value
    },
    setNavigation (state, value) {
      state.themeOpts.navigation = value
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
      const response = await axios.get('track/recent', {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      if (response) commit('SET_RECENT_TRACKS', response.data.tracks)
    },
    async MOST_LIKED ({ commit }) {
      const response = await axios.get('track/mostlike', {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      if (response) commit('SET_MOST_LIKED_TRACKS', response.data.MostLiked)
    },
    async MOST_STREAMED ({ commit }) {
      const response = await axios.get('track/moststreamed', {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      if (response) commit('SET_MOST_STREAMED_TRACKS', response.data.MostStreamed)
    },
    async GET_TRACK_PAGE ({ commit }, payload) {
      const response = await axios.post('track/find-track', { data: payload }, {
        headers: {
          Authorization: 'Bearer ' + process.env.VUE_APP_JWT_KEY
        }
      })
      return response
    }
  },
  modules: {
    auth,
    track
  }
})
