<template>
  <canvas ref="canvasRef" class="flow-field" aria-hidden="true"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Theme colors (Vuetify theme): primary shades only
const COLORS = ['211,47,47', '255,82,82', '154,0,7']
const CELL = 38

const canvasRef = ref(null)
let ctx, raf, width = 0, height = 0, dpr = 1, running = true
let cols = 0, rows = 0, angles = []
const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false, strength: 0 }
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
let observer = null
let isVisible = true

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  dpr = 1
  width = canvas.clientWidth
  height = canvas.clientHeight
  canvas.width = width
  canvas.height = height
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  cols = Math.ceil(width / CELL) + 1
  rows = Math.ceil(height / CELL) + 1
  angles = new Array(cols * rows).fill(0)
}

const onMove = (e) => {
  const canvas = canvasRef.value
  // Only react while the cursor is over the hero area, not the whole page
  const area = (canvas.closest('.profile-hero') || canvas.closest('.track-hero') || canvas).getBoundingClientRect()
  mouse.active = e.clientX >= area.left && e.clientX <= area.right && e.clientY >= area.top && e.clientY <= area.bottom
  if (!mouse.active) return
  const rect = canvas.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  if (mouse.sx < -999) { mouse.sx = mouse.x; mouse.sy = mouse.y }
}

const draw = (ms) => {
  if (!running || !isVisible) return
  const time = ms * 0.001
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'lighter'

  mouse.sx += (mouse.x - mouse.sx) * 0.1
  mouse.sy += (mouse.y - mouse.sy) * 0.1
  mouse.strength += ((mouse.active ? 1 : 0) - mouse.strength) * 0.06

  const radius = 170
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * CELL
      const y = r * CELL
      const idx = r * cols + c

      // Ambient slow wave that keeps the field alive without the cursor
      let target = Math.sin(x * 0.012 + time * 0.8) * 0.35 + Math.cos(y * 0.014 - time * 0.6) * 0.35

      // Cursor swirls nearby bars around itself (perpendicular to the direction to the cursor)
      const dx = x - mouse.sx
      const dy = y - mouse.sy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const influence = Math.exp(-(dist * dist) / (2 * radius * radius)) * mouse.strength
      const swirl = Math.atan2(dy, dx) + Math.PI / 2
      // Shortest angular blend
      let diff = swirl - target
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      target += diff * influence

      // Ease each bar toward its target for a soft, organic response
      let d = target - angles[idx]
      d = Math.atan2(Math.sin(d), Math.cos(d))
      angles[idx] += d * 0.12
      const a = angles[idx]

      // Bars thin out as they tilt, thick when horizontal (like the reference)
      const thickness = 1.5 + 9 * Math.cos(a) * Math.cos(a)
      const len = CELL * 0.82
      const alpha = 0.25 + 0.55 * Math.cos(a) * Math.cos(a) + influence * 0.2

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(a)
      ctx.fillStyle = `rgba(${COLORS[(r + c) % COLORS.length]},${Math.min(alpha, 1).toFixed(3)})`
      ctx.fillRect(-len / 2, -thickness / 2, len, thickness)
      ctx.restore()
    }
  }

  if (!reduceMotion && running && isVisible) raf = requestAnimationFrame(draw)
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMove)

  if ('IntersectionObserver' in window && canvasRef.value) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const wasVisible = isVisible
        isVisible = entry.isIntersecting
        if (isVisible && !wasVisible && running) {
          raf = requestAnimationFrame(draw)
        }
      }
    }, { threshold: 0.05 })
    observer.observe(canvasRef.value)
  }

  raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(raf)
  if (observer) {
    observer.disconnect()
    observer = null
  }
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMove)
})
</script>

<style scoped>
.flow-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
