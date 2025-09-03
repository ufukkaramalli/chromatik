import axios from 'axios'
const base64 = window
const getAudioContext = () => {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    return new AudioContext()
  } catch (e) {
    alert('Sorry, Web Audio API is not supported in this browser')
    return null
  }
}
export default {
  namespaced: true,
  state: {
    analyser: {
      bufferLength: null
    },
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
  },
  getters: {
    GET_CURRENT_TRACK (state) {
      return state.currentTrack
    },
    GET_CURRENT_PLAYLIST (state) {
      return state.currentPlaylist
    },
    GET_PLAYING (state) {
      return state.isPlaying
    },
    GET_IS_LOADING (state) {
      return state.isLoading
    },
    GET_BOTTOM_PLAYER (state) {
      return state.bottomPlayer
    },
    GET_AUDIO_CONTEXT (state) {
      return state.context
    },
    GET_AUDIO_CONTEXT_DESTINATION (state) {
      return state.destination
    },
    GET_SOURCE (state) {
      return state.source
    },
    GET_AUDIO_ELEMENT (state) {
      return state.audioElement
    },
    GET_GAIN_NODE (state) {
      return state.gainNode
    },
    GET_GAIN (state) {
      return state.gainNode.gain.value * 100
    },
    GET_CURRENT_TIME (state) {
      return state.currentTime
    },
    GET_CURRENT_TRACK_INDEX (state) {
      return state.currentTrackIndex
    },
    GET_ANALYSER_NODE (state) {
      return state.analyserNode
    },
    GET_BUFFER_LENGTH (state) {
      return state.analyser.bufferLength
    }
  },
  mutations: {
    SET_CURRENT_TRACK (state, value) {
      state.currentTrack = value
    },
    SET_CURRENT_PLAYLIST (state, value) {
      if (state.currentPlaylist !== value) {
        state.currentPlaylist = value
        // console.log('Current Playlist: ', state.currentPlaylist)
      } else {
        // console.log('Playlist Değişmedi')
      }
    },
    SET_IS_PLAYING (state, value) {
      state.isPlaying = value
    },
    SET_BOTTOM_PLAYER (state, value) {
      state.bottomPlayer = value
    },
    SET_IS_LOADING (state, value) {
      state.isLoading = value
    },
    SET_AUDIO_CONTEXT (state, value) {
      state.context = value
    },
    SET_AUDIO_CONTEXT_DESTINATION (state, value) {
      state.destination = value
    },
    SET_SOURCE (state, value) {
      state.source = value
    },
    SET_AUDIO_ELEMENT (state, value) {
      state.audioElement = value
    },
    SET_GAIN_NODE (state, value) {
      state.gainNode = value
    },
    SET_GAIN (state, volume) {
      state.gainNode.gain.value = volume
    },
    SET_CURRENT_TIME (state, value) {
      state.currentTime = value
    },
    SET_CURRENT_TRACK_INDEX (state, value) {
      state.currentTrackIndex = value
    },
    SET_ANALYSER_NODE (state, value) {
      state.analyserNode = value
    },
    SET_BUFFER_LENGTH (state, value) {
      state.analyser.bufferLength = value
    }
  },
  actions: {
    async clickedPlay ({ commit, getters, dispatch }, payload) {
      commit('SET_IS_LOADING', true)
      // ! IF CURRENT TRACK NOT EQUALS TO PAYLOAD
      if (getters.GET_CURRENT_TRACK !== payload.track) {
        // SET CURRENT TRACK & TRACK_INDEX
        await commit('SET_CURRENT_TRACK', payload.track)
        await commit('SET_CURRENT_TRACK_INDEX', payload.trackIndex)
        await dispatch('GET_STREAM_SOURCE', getters.GET_CURRENT_TRACK.id).then((StreamSource) => {
          if (getters.GET_AUDIO_CONTEXT) {
            // IF AUDIO_CONTEXT WAS CREATED ONCE
            getters.GET_SOURCE.disconnect()
            getters.GET_ANALYSER_NODE.disconnect()
            getters.GET_GAIN_NODE.disconnect()
          } else {
            // SET AUDIO_CONTEXT
            commit('SET_AUDIO_CONTEXT', getAudioContext())
            commit('SET_AUDIO_CONTEXT_DESTINATION', getters.GET_AUDIO_CONTEXT.destination)
            // IF AUDIO_CONTEXT GAIN_NODE NOT CREATED WAS ONCE
            if (!getters.GET_GAIN_NODE) {
              // CREATE GAIN_NODE
              commit('SET_GAIN_NODE', getters.GET_AUDIO_CONTEXT.createGain())
            }
            if (!getters.GET_ANALYSER_NODE) {
              // CREATE ANALYSER_NODE
              commit('SET_ANALYSER_NODE', getters.GET_AUDIO_CONTEXT.createAnalyser())
              getters.GET_ANALYSER_NODE.fftSize = 512
            }
          }
          commit('SET_AUDIO_ELEMENT', new Audio(StreamSource))
          commit('SET_SOURCE', getters.GET_AUDIO_CONTEXT.createMediaElementSource(getters.GET_AUDIO_ELEMENT))
          getters.GET_SOURCE.connect(getters.GET_ANALYSER_NODE)
          getters.GET_ANALYSER_NODE.connect(getters.GET_GAIN_NODE)
          getters.GET_GAIN_NODE.connect(getters.GET_AUDIO_CONTEXT_DESTINATION)
          getters.GET_AUDIO_ELEMENT.load()
          getters.GET_AUDIO_ELEMENT.play()
          /// SET GAIN_NODEs DEFAULT VOLUME VALUE
          commit('SET_GAIN', 0)
          // FADE-IN
          getters.GET_GAIN_NODE.gain.linearRampToValueAtTime(1, getters.GET_AUDIO_CONTEXT.currentTime + 0.4)
          // FOR ANALYZER
          commit('SET_BUFFER_LENGTH', getters.GET_ANALYSER_NODE.frequencyBinCount)
          commit('SET_IS_LOADING', false)
          commit('SET_IS_PLAYING', true)
          axios.post('track/play-increase', { id: getters.GET_CURRENT_TRACK.id })
        })
      } else {
        await commit('SET_IS_LOADING', false)
        await commit('SET_IS_PLAYING', true)
        getters.GET_AUDIO_ELEMENT.play()
      }
    },
    async clickedLike ({ commit, getters, state }, payload) {
      var form = { id: payload }
      await axios.post('track/like', form)
    },
    async clickedUnlike ({ commit, getters, state }, payload) {
      var form = { id: payload }
      await axios.post('track/unlike', form)
    },
    async GET_STREAM_SOURCE ({ dispatch }, payload) {
      var response = await axios.post('track/stream', { id: payload }).then((response) => {
        return base64.atob(response.data)
      })
      return response
    },
    async SET_NEXT_TRACK ({ getters, dispatch }) {
      getters.GET_SOURCE.disconnect()
      var index = getters.GET_CURRENT_TRACK_INDEX + 1
      var nextTrack = getters.GET_CURRENT_PLAYLIST[index]
      if (index > (getters.GET_CURRENT_PLAYLIST.length - 1)) {
        var firstTrack = getters.GET_CURRENT_PLAYLIST[0]
        dispatch('clickedPlay', { trackIndex: 0, track: firstTrack }).then(() => {
          console.log('First Track Setted', getters.GET_CURRENT_TRACK_INDEX)
        })
      } else {
        dispatch('clickedPlay', { trackIndex: index, track: nextTrack }).then(() => {
          console.log('Next Track Setted', getters.GET_CURRENT_TRACK_INDEX)
        })
      }
    },
    async SET_PREVIOUS_TRACK ({ getters, dispatch }) {
      getters.GET_SOURCE.disconnect()
      var index = getters.GET_CURRENT_TRACK_INDEX - 1
      var previousTrack = getters.GET_CURRENT_PLAYLIST[index]
      if (index < 0) {
        var lastIndex = getters.GET_CURRENT_PLAYLIST.length - 1
        var lastTrack = getters.GET_CURRENT_PLAYLIST[lastIndex]
        dispatch('clickedPlay', { trackIndex: lastIndex, track: lastTrack }).then(() => {
          console.log('Last Track Setted', getters.GET_CURRENT_TRACK_INDEX)
        })
      } else {
        dispatch('clickedPlay', { trackIndex: index, track: previousTrack }).then(() => {
          console.log('Previous Track Setted', getters.GET_CURRENT_TRACK_INDEX)
        })
      }
    }
  }
}
