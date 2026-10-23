import { defineStore } from 'pinia'
import { api } from '@/lib/axios'
import type { TrackLike } from '@/types/audio'

export interface ThemeOptions {
  topnav: boolean
  navigation: boolean
  systemBar: boolean
}

export interface AppStats {
  producersCount: number
  tracksCount: number
}

export interface AppState {
  themeOpts: ThemeOptions
  loginOverlay: boolean
  appName: string
  RecentTracks: TrackLike[] | null
  MostLiked: TrackLike[] | null
  MostStreamed: TrackLike[] | null
  stats: AppStats
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    themeOpts: {
      topnav: true,
      navigation: false,
      systemBar: true
    },
    loginOverlay: false,
    appName: (import.meta.env.VITE_APPLICATION_NAME as string) || 'Chromatik',
    RecentTracks: null,
    MostLiked: null,
    MostStreamed: null,
    stats: {
      producersCount: 0,
      tracksCount: 0
    }
  }),

  getters: {
    getTopNav: (s): boolean => s.themeOpts.topnav,
    getNavigation: (s): boolean => s.themeOpts.navigation,
    getSystemBar: (s): boolean => s.themeOpts.systemBar,
    getLoginOverlay: (s): boolean => s.loginOverlay,
    getAppName: (s): string => s.appName,
    GET_RECENT_TRACKS: (s): TrackLike[] | null => s.RecentTracks,
    GET_MOST_LIKED_TRACKS: (s): TrackLike[] | null => s.MostLiked,
    GET_MOST_STREAMED_TRACKS: (s): TrackLike[] | null => s.MostStreamed,
    GET_STATS: (s): AppStats => s.stats
  },

  actions: {
    setTopNav(v: boolean) { this.themeOpts.topnav = v },
    setNavigation(v: boolean) { this.themeOpts.navigation = v },
    setSystemBar(v: boolean) { this.themeOpts.systemBar = v },
    setLoginOverlay(v: boolean) { this.loginOverlay = v },

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
      if (res?.data) this.RecentTracks = res.data.tracks
    },

    async MOST_LIKED() {
      const res = await api.get('/track/mostlike')
      if (res?.data) this.MostLiked = res.data.MostLiked
    },

    async MOST_STREAMED() {
      const res = await api.get('/track/moststreamed')
      if (res?.data) this.MostStreamed = res.data.MostStreamed
    },

    async GET_TRACK_PAGE(payload: unknown) {
      const res = await api.post('/track/find-track', { data: payload })
      return res
    }
  }
})
