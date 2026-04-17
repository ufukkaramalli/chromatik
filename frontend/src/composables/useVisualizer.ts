import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { engine } from '@/services/AudioEngine'
import { usePlayerStore } from '@/stores/playerStore'

export function useVisualizer(canvasRef: Ref<HTMLCanvasElement | null>) {
  const player = usePlayerStore()
  
  let animationFrameId: number | null = null
  let analyserNode: AnalyserNode | null = engine.analyserNode
  let dataArray: Uint8Array | null = null

  // We listen if the engine re-creates the analyser (e.g. context was recreated)
  engine.on('analyser-ready', (node) => {
    analyserNode = node
    dataArray = new Uint8Array(node.frequencyBinCount)
  })
  
  if (analyserNode) {
    dataArray = new Uint8Array(analyserNode.frequencyBinCount)
  }

  const draw = () => {
    if (!canvasRef.value || !analyserNode || !dataArray) return

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const bufferLength = analyserNode.frequencyBinCount

    // Update dimensions in case of resize
    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }

    // @ts-ignore - TS DOM lib mismatch with Uint8Array generic types
    analyserNode.getByteFrequencyData(dataArray)

    ctx.clearRect(0, 0, width, height)
    
    // Draw Bars (based on previous implementation logic but optimized)
    const barWidth = (width / bufferLength) * 2.6
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2
        
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`
        ctx.fillRect(x, height - barHeight / 2, barWidth, barHeight)
        
        x += barWidth + 1
    }

    if (player.status === 'playing') {
      animationFrameId = requestAnimationFrame(draw)
    }
  }

  const startAnimation = () => {
    if (!animationFrameId) {
      draw()
    }
  }

  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  watch(() => player.status, (status) => {
    if (status === 'playing') {
      startAnimation()
    } else {
      // give it one last draw so it doesn't freeze weirdly
      draw()
      stopAnimation()
    }
  })

  onMounted(() => {
    if (player.status === 'playing') {
      startAnimation()
    }
  })

  onUnmounted(() => {
    stopAnimation()
  })

  return {
    draw
  }
}
