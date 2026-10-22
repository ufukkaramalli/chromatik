import { defineStore } from 'pinia'
import { api } from '@/lib/axios'

export const useAppStore = defineStore('app', {
  state: () => ({
    themeOpts: {
      topnav: true,
      navigation: false,
      systemBar: true
    },
    loginOverlay: false,
    appName: import.meta.env.VITE_APPLICATION_NAME || 'Chromatik',
    RecentTracks: null,
    MostLiked: null,
    MostStreamed: null,
    stats: {
      producersCount: 0,
      tracksCount: 0
    }
  }),

  getters: {
    getTopNav: (s) => s.themeOpts.topnav,
    getNavigation: (s) => s.themeOpts.navigation,
    getSystemBar: (s) => s.themeOpts.systemBar,
    getLoginOverlay: (s) => s.loginOverlay,
    getAppName: (s) => s.appName,
    GET_RECENT_TRACKS: (s) => s.RecentTracks,
    GET_MOST_LIKED_TRACKS: (s) => s.MostLiked,
    GET_MOST_STREAMED_TRACKS: (s) => s.MostStreamed,
    GET_STATS: (s) => s.stats
  },

  actions: {
    setTopNav(v) { this.themeOpts.topnav = v },
    setNavigation(v) { this.themeOpts.navigation = v },
    setSystemBar(v) { this.themeOpts.systemBar = v },
    setLoginOverlay(v) { this.loginOverlay = v },

    async FETCH_STATS() {
      try {
        const res = await api.get('/track/stats')
        if (res?.data) {
          this.stats = {
            producersCount: res.data.producersCount ?? res.data.producers ?? 0,
            tracksCount: res.data.tracksCount ?? res.data.tracks ?? 0
          }
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    },

    async RECENT_TRACKS() {
      const res = await api.get('/track/recent')
      if (res) this.RecentTracks = res.data.tracks
    },

    async MOST_LIKED() {
      const res = await api.get('/track/mostlike')
      if (res) this.MostLiked = res.data.MostLiked
    },

    async MOST_STREAMED() {
      const res = await api.get('/track/moststreamed')
      if (res) this.MostStreamed = res.data.MostStreamed
    },

    async GET_TRACK_PAGE (payload) {
      const res = await api.post('/track/find-track', { data: payload })
      return res
    }
  }
})