<template>
  <v-row>
    <v-col cols="12" class="pa-0">
        <canvas class="canvas" ref="analyser"></canvas>
    </v-col>
  </v-row>
</template>
<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      canvas: null,
      context: null,
      bufferLength: null,
      data: null,
      barWidth: null,
      barHeight: null,
      fps: 0,
      last: 0.0
    }
  },
  created () {
  },
  mounted () {
    this.canvas = this.$refs.analyser
    this.canvas.width = this.canvas.parentElement.clientWidth
    this.canvas.height = this.canvas.parentElement.clientHeight
  },
  methods: {
    drawCanvas () {
      this.context = this.canvas.getContext('2d')
      this.context.lineWidth = 3
      this.context.strokeStyle = '#FFFFFF'
      const bufferLength = this.getAnalyserBufferLength
      const update = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.save()
        this.context.moveTo(0, this.canvas.height / 2)
        this.context.beginPath()
        this.data = new Uint8Array(bufferLength)
        this.getAnalyser.getByteFrequencyData(this.data)
        this.data.forEach((p, i) => {
          this.context.lineTo(i * (this.canvas.width / bufferLength), p)
        })
        this.context.stroke()
        this.context.restore()
        if (this.getPlaying) {
          window.requestAnimationFrame(update.bind(this))
        }
      }
      window.requestAnimationFrame(update.bind(this))
    },
    draw () {
      this.context = this.canvas.getContext('2d')
      this.context.lineWidth = 2
      this.context.strokeStyle = '#FFFFFF'
      const bufferLength = this.getAnalyserBufferLength
      const update = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.save()
        this.context.moveTo(0, this.canvas.height / 2)
        this.context.beginPath()
        this.data = new Uint8Array(bufferLength)
        this.getAnalyser.getByteFrequencyData(this.data)
        var barWidth = (this.canvas.width / bufferLength) * 2.6
        var barHeight
        var x = 0
        for (var i = 0; i < bufferLength; i++) {
          barHeight = this.data[i] / 2
          this.context.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
          this.context.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight)
          x += barWidth + 1
        }
        this.context.stroke()
        this.context.restore()
        if (this.getPlaying) {
          window.requestAnimationFrame(update.bind(this))
        }
      }
      window.requestAnimationFrame(update.bind(this))
    },
    monitorFPS () {
      const throttled = _.throttle(frame => {
        this.fps = Math.round((1.0 / frame) * 10000) / 10000
      }, 300)
      const tick = t => {
        const frame = (t - this.last) / 1000
        throttled(frame)
        this.last = t
        if (this.getPlaying) {
          window.requestAnimationFrame(tick)
        }
      }
      window.requestAnimationFrame(tick)
    }
  },
  computed: {
    ...mapGetters({
      getPlaying: 'track/GET_PLAYING',
      getAnalyser: 'track/GET_ANALYSER_NODE',
      getAnalyserBufferLength: 'track/GET_BUFFER_LENGTH'
    })
  },
  watch: {
    'getPlaying' () {
      this.monitorFPS()
      this.draw()
    },
    'canvas.parentElement.clientWidth' () {
      // console.log('WIDTH')
    }
  }
}
</script>
<style lang="scss">
  .canvas{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    width: 100%;
  }
</style>
