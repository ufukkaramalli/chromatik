import { defineStore } from 'pinia'
import { api } from '@/lib/axios'

const getAudioContext = () => {
  try {
    // Safari fallback
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    return new AudioContext()
  } catch (e) {
    alert('Sorry, Web Audio API is not supported in this browser')
    return null
  }
}

export const useTrackStore = defineStore('track', {
  state: () => ({
    analyser: { bufferLength: null },
    analyserNode: null,
    context: null,
    destination: null,
    source: null,
    audioElement: null,
    gainNode: null,
    currentTrackIndex: null,
    currentTrack: null,
    currentPlaylist: null,
    currentTime: null,
    isPlaying: false,
    isLoading: false,
    bottomPlayer: false
  }),

  getters: {
    GET_CURRENT_TRACK: (s) => s.currentTrack,
    GET_CURRENT_PLAYLIST: (s) => s.currentPlaylist,
    GET_PLAYING: (s) => s.isPlaying,
    GET_IS_LOADING: (s) => s.isLoading,
    GET_BOTTOM_PLAYER: (s) => s.bottomPlayer,
    GET_AUDIO_CONTEXT: (s) => s.context,
    GET_AUDIO_CONTEXT_DESTINATION: (s) => s.destination,
    GET_SOURCE: (s) => s.source,
    GET_AUDIO_ELEMENT: (s) => s.audioElement,
    GET_GAIN_NODE: (s) => s.gainNode,
    GET_GAIN: (s) => (s.gainNode ? s.gainNode.gain.value * 100 : 0),
    GET_CURRENT_TIME: (s) => s.currentTime,
    GET_CURRENT_TRACK_INDEX: (s) => s.currentTrackIndex,
    GET_ANALYSER_NODE: (s) => s.analyserNode,
    GET_BUFFER_LENGTH: (s) => s.analyser.bufferLength
  },

  actions: {
    // == mutations yerine doğrudan state ==
    SET_CURRENT_TRACK (v) { this.currentTrack = v },
    SET_CURRENT_PLAYLIST (v) { this.currentPlaylist = v },
    SET_IS_PLAYING (v) { this.isPlaying = v },
    SET_BOTTOM_PLAYER (v) { this.bottomPlayer = v },
    SET_IS_LOADING (v) { this.isLoading = v },
    SET_AUDIO_CONTEXT (v) { this.context = v },
    SET_AUDIO_CONTEXT_DESTINATION (v) { this.destination = v },
    SET_SOURCE (v) { this.source = v },
    SET_AUDIO_ELEMENT (v) { this.audioElement = v },
    SET_GAIN_NODE (v) { this.gainNode = v },
    SET_GAIN (volume) { if (this.gainNode) this.gainNode.gain.value = volume },
    SET_CURRENT_TIME (v) { this.currentTime = v },
    SET_CURRENT_TRACK_INDEX (v) { this.currentTrackIndex = v },
    SET_ANALYSER_NODE (v) { this.analyserNode = v },
    SET_BUFFER_LENGTH (v) { this.analyser.bufferLength = v },

    async clickedPlay(payload) {
      this.SET_IS_LOADING(true)

      const isNewTrack = this.GET_CURRENT_TRACK !== payload.track

      if (isNewTrack) {
        this.SET_CURRENT_TRACK(payload.track)
        this.SET_CURRENT_TRACK_INDEX(payload.trackIndex)

        const StreamSource = await this.GET_STREAM_SOURCE(payload.track.id)

        if (!this.GET_AUDIO_CONTEXT) {
          this.SET_AUDIO_CONTEXT(getAudioContext())
          this.SET_AUDIO_CONTEXT_DESTINATION(this.GET_AUDIO_CONTEXT?.destination)

          if (!this.GET_GAIN_NODE && this.GET_AUDIO_CONTEXT) {
            this.SET_GAIN_NODE(this.GET_AUDIO_CONTEXT.createGain())
          }

          if (!this.GET_ANALYSER_NODE && this.GET_AUDIO_CONTEXT) {
            const analyser = this.GET_AUDIO_CONTEXT.createAnalyser()
            analyser.fftSize = 512
            this.SET_ANALYSER_NODE(analyser)
          }
        } else {
          this.GET_SOURCE?.disconnect()
          this.GET_ANALYSER_NODE?.disconnect()
          this.GET_GAIN_NODE?.disconnect()
        }

        const audio = new Audio(StreamSource)
        this.SET_AUDIO_ELEMENT(audio)

        const source = this.GET_AUDIO_CONTEXT.createMediaElementSource(audio)
        this.SET_SOURCE(source)

        source.connect(this.GET_ANALYSER_NODE)
        this.GET_ANALYSER_NODE.connect(this.GET_GAIN_NODE)
        this.GET_GAIN_NODE.connect(this.GET_AUDIO_CONTEXT_DESTINATION)

        this.GET_GAIN_NODE.gain.setValueAtTime(0, this.GET_AUDIO_CONTEXT.currentTime)
        this.GET_GAIN_NODE.gain.linearRampToValueAtTime(1, this.GET_AUDIO_CONTEXT.currentTime + 0.4)

        this.SET_BUFFER_LENGTH(this.GET_ANALYSER_NODE.frequencyBinCount)

        audio.load()
        await audio.play()

        this.SET_IS_LOADING(false)
        this.SET_IS_PLAYING(true)

        // 🔁 sayaç artır
        api.post('/track/play-increase', { id: payload.track.id }).catch(() => {})
      } else {
        this.SET_IS_LOADING(false)
        this.SET_IS_PLAYING(true)
        this.GET_AUDIO_ELEMENT?.play()
      }
    },

    async clickedLike(id) {
      await api.post('/track/like', { id })
    },

    async clickedUnlike(id) {
      await api.post('/track/unlike', { id })
    },

    async GET_STREAM_SOURCE(id) {
      const res = await api.post('/track/stream', { id })
      return atob(res.data)
    },

    async SET_NEXT_TRACK() {
      this.GET_SOURCE?.disconnect()

      let index = (this.GET_CURRENT_TRACK_INDEX ?? -1) + 1
      if (!this.GET_CURRENT_PLAYLIST || index >= this.GET_CURRENT_PLAYLIST.length) index = 0

      const nextTrack = this.GET_CURRENT_PLAYLIST?.[index]
      if (nextTrack) this.clickedPlay({ trackIndex: index, track: nextTrack })
    },

    async SET_PREVIOUS_TRACK() {
      this.GET_SOURCE?.disconnect()

      let index = (this.GET_CURRENT_TRACK_INDEX ?? 0) - 1
      if (!this.GET_CURRENT_PLAYLIST || index < 0) {
        index = (this.GET_CURRENT_PLAYLIST?.length || 1) - 1
      }

      const prevTrack = this.GET_CURRENT_PLAYLIST?.[index]
      if (prevTrack) this.clickedPlay({ trackIndex: index, track: prevTrack })
    }
  }
})