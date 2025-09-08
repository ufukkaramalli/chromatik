import { api } from '@/lib/axios'

const getAudioContext = () => {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    return new AudioContext()
  } catch (e) {
    alert('Sorry, Web Audio API is not supported in this browser')
    return null
  }
}

export default {
  namespaced: true,
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
    GET_CURRENT_TRACK: state => state.currentTrack,
    GET_CURRENT_PLAYLIST: state => state.currentPlaylist,
    GET_PLAYING: state => state.isPlaying,
    GET_IS_LOADING: state => state.isLoading,
    GET_BOTTOM_PLAYER: state => state.bottomPlayer,
    GET_AUDIO_CONTEXT: state => state.context,
    GET_AUDIO_CONTEXT_DESTINATION: state => state.destination,
    GET_SOURCE: state => state.source,
    GET_AUDIO_ELEMENT: state => state.audioElement,
    GET_GAIN_NODE: state => state.gainNode,
    GET_GAIN: state => state.gainNode?.gain.value * 100,
    GET_CURRENT_TIME: state => state.currentTime,
    GET_CURRENT_TRACK_INDEX: state => state.currentTrackIndex,
    GET_ANALYSER_NODE: state => state.analyserNode,
    GET_BUFFER_LENGTH: state => state.analyser.bufferLength
  },
  mutations: {
    SET_CURRENT_TRACK: (state, value) => { state.currentTrack = value },
    SET_CURRENT_PLAYLIST: (state, value) => { state.currentPlaylist = value },
    SET_IS_PLAYING: (state, value) => { state.isPlaying = value },
    SET_BOTTOM_PLAYER: (state, value) => { state.bottomPlayer = value },
    SET_IS_LOADING: (state, value) => { state.isLoading = value },
    SET_AUDIO_CONTEXT: (state, value) => { state.context = value },
    SET_AUDIO_CONTEXT_DESTINATION: (state, value) => { state.destination = value },
    SET_SOURCE: (state, value) => { state.source = value },
    SET_AUDIO_ELEMENT: (state, value) => { state.audioElement = value },
    SET_GAIN_NODE: (state, value) => { state.gainNode = value },
    SET_GAIN: (state, volume) => {
      if (state.gainNode) state.gainNode.gain.value = volume
    },
    SET_CURRENT_TIME: (state, value) => { state.currentTime = value },
    SET_CURRENT_TRACK_INDEX: (state, value) => { state.currentTrackIndex = value },
    SET_ANALYSER_NODE: (state, value) => { state.analyserNode = value },
    SET_BUFFER_LENGTH: (state, value) => { state.analyser.bufferLength = value }
  },
  actions: {
    async clickedPlay({ commit, getters, dispatch }, payload) {
      commit('SET_IS_LOADING', true)

      const isNewTrack = getters.GET_CURRENT_TRACK !== payload.track

      if (isNewTrack) {
        commit('SET_CURRENT_TRACK', payload.track)
        commit('SET_CURRENT_TRACK_INDEX', payload.trackIndex)

        const StreamSource = await dispatch('GET_STREAM_SOURCE', payload.track.id)

        if (!getters.GET_AUDIO_CONTEXT) {
          commit('SET_AUDIO_CONTEXT', getAudioContext())
          commit('SET_AUDIO_CONTEXT_DESTINATION', getters.GET_AUDIO_CONTEXT.destination)

          if (!getters.GET_GAIN_NODE) {
            commit('SET_GAIN_NODE', getters.GET_AUDIO_CONTEXT.createGain())
          }

          if (!getters.GET_ANALYSER_NODE) {
            const analyser = getters.GET_AUDIO_CONTEXT.createAnalyser()
            analyser.fftSize = 512
            commit('SET_ANALYSER_NODE', analyser)
          }
        } else {
          if (getters.GET_SOURCE) getters.GET_SOURCE.disconnect()
          if (getters.GET_ANALYSER_NODE) getters.GET_ANALYSER_NODE.disconnect()
          if (getters.GET_GAIN_NODE) getters.GET_GAIN_NODE.disconnect()
        }

        const audio = new Audio(StreamSource)
        commit('SET_AUDIO_ELEMENT', audio)

        const source = getters.GET_AUDIO_CONTEXT.createMediaElementSource(audio)
        commit('SET_SOURCE', source)

        source.connect(getters.GET_ANALYSER_NODE)
        getters.GET_ANALYSER_NODE.connect(getters.GET_GAIN_NODE)
        getters.GET_GAIN_NODE.connect(getters.GET_AUDIO_CONTEXT_DESTINATION)

        getters.GET_GAIN_NODE.gain.setValueAtTime(0, getters.GET_AUDIO_CONTEXT.currentTime)
        getters.GET_GAIN_NODE.gain.linearRampToValueAtTime(1, getters.GET_AUDIO_CONTEXT.currentTime + 0.4)

        commit('SET_BUFFER_LENGTH', getters.GET_ANALYSER_NODE.frequencyBinCount)

        audio.load()
        await audio.play()

        commit('SET_IS_LOADING', false)
        commit('SET_IS_PLAYING', true)

        // 🔁 sayaç artır
        api.post('/track/play-increase', { id: payload.track.id })
      } else {
        commit('SET_IS_LOADING', false)
        commit('SET_IS_PLAYING', true)
        getters.GET_AUDIO_ELEMENT?.play()
      }
    },

    async clickedLike(_, payload) {
      await api.post('/track/like', { id: payload })
    },

    async clickedUnlike(_, payload) {
      await api.post('/track/unlike', { id: payload })
    },

    async GET_STREAM_SOURCE(_, payload) {
      const res = await api.post('/track/stream', { id: payload })
      return atob(res.data)
    },

    async SET_NEXT_TRACK({ getters, dispatch }) {
      if (getters.GET_SOURCE) getters.GET_SOURCE.disconnect()

      let index = getters.GET_CURRENT_TRACK_INDEX + 1
      if (index >= getters.GET_CURRENT_PLAYLIST.length) index = 0

      const nextTrack = getters.GET_CURRENT_PLAYLIST[index]
      dispatch('clickedPlay', { trackIndex: index, track: nextTrack })
    },

    async SET_PREVIOUS_TRACK({ getters, dispatch }) {
      if (getters.GET_SOURCE) getters.GET_SOURCE.disconnect()

      let index = getters.GET_CURRENT_TRACK_INDEX - 1
      if (index < 0) index = getters.GET_CURRENT_PLAYLIST.length - 1

      const prevTrack = getters.GET_CURRENT_PLAYLIST[index]
      dispatch('clickedPlay', { trackIndex: index, track: prevTrack })
    }
  }
}