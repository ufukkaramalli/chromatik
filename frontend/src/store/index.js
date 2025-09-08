import { createStore } from 'vuex'
import auth from './auth'
import track from './track'
import { api } from '@/lib/axios'   // ⬅️ axios yerine instance

export default createStore({
  state: {
    themeOpts: {
      topnav: true,
      navigation: false,
      systemBar: true
    },
    loginOverlay: false,
    appName: import.meta.env.VITE_APPLICATION_NAME || 'Chromatique',
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
    setTopNav (state, value) { state.themeOpts.topnav = value },
    setNavigation (state, value) { state.themeOpts.navigation = value },
    setSystemBar (state, value) { state.themeOpts.systemBar = value },
    setLoginOverlay (state, value) { state.loginOverlay = value },
    SET_RECENT_TRACKS (state, value) { state.RecentTracks = value },
    SET_MOST_LIKED_TRACKS (state, value) { state.MostLiked = value },
    SET_MOST_STREAMED_TRACKS (state, value) { state.MostStreamed = value }
  },
  actions: {
    async RECENT_TRACKS ({ commit }) {
      // baseURL = /api olduğundan URL'ler MUTLAKA / ile başlamalı
      const res = await api.get('/track/recent')
      if (res) commit('SET_RECENT_TRACKS', res.data.tracks)
    },
    async MOST_LIKED ({ commit }) {
      const res = await api.get('/track/mostlike')
      if (res) commit('SET_MOST_LIKED_TRACKS', res.data.MostLiked)
    },
    async MOST_STREAMED ({ commit }) {
      const res = await api.get('/track/moststreamed')
      if (res) commit('SET_MOST_STREAMED_TRACKS', res.data.MostStreamed)
    },
    async GET_TRACK_PAGE (_ctx, payload) {
      const res = await api.post('/track/find-track', { data: payload })
      return res
    }
  },
  modules: { auth, track }
})