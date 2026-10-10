<template>
  <canvas ref="canvasRef" class="wave-field" aria-hidden="true"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Theme colors (Vuetify theme): primary shades only
const COLORS = ['211,47,47', '255,82,82', '154,0,7']
const LINE_COUNT = 50
const STEP = 8

const canvasRef = ref(null)
let ctx, raf, width = 0, height = 0, dpr = 1, running = true
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
  if (!running) return
  const time = ms * 0.001
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineWidth = 1

  // Eased mouse follow
  mouse.sx += (mouse.x - mouse.sx) * 0.08
  mouse.sy += (mouse.y - mouse.sy) * 0.08
  mouse.strength += ((mouse.active ? 1 : 0) - mouse.strength) * 0.06

  for (let i = 0; i < LINE_COUNT; i++) {
    const t = i / (LINE_COUNT - 1)
    ctx.beginPath()
    for (let x = -STEP; x <= width + STEP; x += STEP) {
      const u = x / width
      // Ribbon spine drifting up/down
      const center = height * 0.5 + Math.sin(u * 3.2 + time * 0.45) * height * 0.16
      // Ribbon thickness breathing along its length
      const spread = height * (0.2 + 0.14 * Math.sin(u * 2.4 - time * 0.35 + 1.3))
      // Twisting: each line follows a phase-shifted sine, so the bundle folds like a ribbon
      const twist = Math.sin(t * Math.PI * 2 + u * 5 + time * 0.7)
      let y = center + twist * spread * (0.55 + 0.45 * Math.sin(t * 3 + time * 0.2))
      // Fine ripple unique to each line
      y += Math.sin(u * 18 + t * 9 + time * 1.1) * 4

      // Cursor attracts nearby lines
      const dx = x - mouse.sx
      const dy = y - mouse.sy
      const falloff = Math.exp(-(dx * dx + dy * dy) / (2 * 110 * 110))
      y += (mouse.sy - y) * 0.3 * falloff * mouse.strength

      if (x === -STEP) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    const alpha = 0.18 + 0.3 * Math.abs(Math.sin(t * Math.PI * 3 + time * 0.5))
    ctx.strokeStyle = `rgba(${COLORS[i % COLORS.length]},${alpha.toFixed(3)})`
    ctx.stroke()
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
.wave-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
