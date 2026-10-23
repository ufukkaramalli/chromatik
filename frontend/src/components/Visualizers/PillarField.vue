<template>
  <canvas ref="canvasRef" class="pillar-field" aria-hidden="true"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'

const { isDark } = useAppTheme()

// Theme colors (Vuetify theme): dark crimson -> primary reds only
// Palette: warm theme reds up front, cool blue/purple receding into the distance
const DARK = '10,2,5'
const LIGHT_SURFACE = '248,250,252'
const COLORS = ['154,0,7', '211,47,47', '255,82,82']
const BLUE = '100,90,235'
const BLUE_LIGHT = '155,145,255'
const PURPLE = '140,55,200'
const PURPLE_DARK = '60,20,110'
// Haze color by depth: far = blue, mid = purple, near = deep red
const hazeFor = (z) => (z < 0.45 ? BLUE : z < 0.75 ? PURPLE : '120,10,30')
const rimFor = (z) => (z < 0.45 ? BLUE_LIGHT : z < 0.75 ? '190,120,255' : '255,82,82')
const BANDS = [
  [0.0, 0.45],
  [0.45, 0.75],
  [0.75, 2]
]

const canvasRef = ref(null)
let ctx, raf, width = 0, height = 0, dpr = 1, running = true
let pillars = [], fog = []
const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, nx: 0.5, snx: 0.5, active: false, strength: 0 }
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
let observer = null
let isVisible = true

// Deterministic pseudo random so the layout stays stable between resizes
const rand = (seed) => {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const build = () => {
  pillars = []
  // Capped count to keep FPS at 60 without choking CPU/GPU
  const count = Math.max(8, Math.min(20, Math.round(width / 75)))
  for (let i = 0; i < count; i++) {
    const z = 0.15 + Math.pow(rand(i + 1), 0.8) * 0.85 // depth: far .. near
    pillars.push({
      x: (i / count) * width * 1.15 - width * 0.07 + (rand(i + 50) - 0.5) * 50,
      w: (20 + rand(i + 7) * 90) * Math.pow(z, 1.35),
      z,
      red: rand(i + 21) > 0.5,
      tone: Math.floor(rand(i + 33) * COLORS.length),
      phase: rand(i + 90) * Math.PI * 2,
      // Far pillars end lower so the top of the scene feels like open space
      top: z < 0.5 ? height * (0.08 + rand(i + 120) * 0.25) * (1 - z) : -10
    })
  }
  pillars.sort((a, b) => a.z - b.z)

  fog = []
  BANDS.forEach((band, bi) => {
    const depth = bi === 0 ? 0.4 : bi === 1 ? 0.7 : 1
    for (let i = 0; i < 3; i++) {
      const seed = bi * 40 + i
      fog.push({
        band: bi,
        depth,
        x: rand(seed + 200) * width,
        y: height * (0.8 + rand(seed + 230) * 0.22),
        r: (110 + rand(seed + 260) * 150) * (0.6 + depth * 0.9),
        speed: (0.05 + rand(seed + 290) * 0.1) * (0.5 + depth),
        phase: rand(seed + 320) * Math.PI * 2,
        color:
          bi === 0
            ? (i % 2 ? BLUE : BLUE_LIGHT)
            : bi === 1
              ? (i % 2 ? PURPLE : '190,120,255')
              : COLORS[(i + bi) % COLORS.length],
        push: 0
      })
    }
  })
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  // 1x DPR avoids 4x overdraw on high-dpi screens for ambient background
  dpr = 1
  width = canvas.clientWidth
  height = canvas.clientHeight
  canvas.width = width
  canvas.height = height
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  build()
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
  // Position within the whole hero (0..1) drives the parallax
  mouse.nx = (e.clientX - area.left) / area.width
  if (mouse.sx < -999) { mouse.sx = mouse.x; mouse.sy = mouse.y }
}

// Backlight glow behind the far pillars so they read as silhouettes
const drawBacklight = (time) => {
  const dark = isDark.value
  const clearColor = dark ? DARK : LIGHT_SURFACE
  ctx.globalCompositeOperation = 'source-over'
  const cx = width * (0.55 + Math.sin(time * 0.1) * 0.05)
  // Cool blue light far back, upper right (like light through a doorway)
  const bgl = ctx.createRadialGradient(width * 0.78, height * 0.25, 0, width * 0.78, height * 0.25, Math.max(width, height) * 0.7)
  bgl.addColorStop(0, dark ? `rgba(${BLUE_LIGHT},0.35)` : `rgba(${BLUE},0.18)`)
  bgl.addColorStop(0.5, dark ? `rgba(${PURPLE},0.14)` : `rgba(${PURPLE},0.08)`)
  bgl.addColorStop(1, `rgba(${clearColor},0)`)
  ctx.fillStyle = bgl
  ctx.fillRect(0, 0, width, height)
  // Warm pink glow rising from the floor
  const g = ctx.createRadialGradient(cx, height * 0.9, 0, cx, height * 0.9, Math.max(width, height) * 0.8)
  g.addColorStop(0, dark ? 'rgba(255,82,82,0.3)' : 'rgba(211,47,47,0.18)')
  g.addColorStop(0.45, dark ? `rgba(${PURPLE},0.14)` : `rgba(${PURPLE},0.08)`)
  g.addColorStop(1, `rgba(${clearColor},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)
}

// pz = animated depth (camera dolly changes it every frame), p.z = resting depth
const drawPillar = (p, pz, time, parallax, vx, yoff) => {
  // Z axis: perspective. Pillars slide away from / toward the vanishing point and grow or shrink
  const persp = (0.5 + pz) / (0.5 + p.z)
  const sway = Math.sin(time * 0.35 + p.phase) * 10 * pz
  const x = vx + (p.x - vx) * persp + sway + parallax * Math.pow(pz, 1.6)
  const w = p.w * Math.pow(pz / p.z, 1.35)
  const side = w * 0.32 // width of the visible side face (perspective)
  const left = x - w / 2
  // Extra height above/below the view so the Y movement never reveals an edge
  const y0 = p.top < 0 ? -140 : p.top
  const h = height + 140 - y0
  const far = Math.max(0, 1 - pz) // 0 near .. ~0.85 far

  ctx.save()
  // Y axis: camera bob/pitch, near pillars move more than far ones
  ctx.translate(0, yoff * Math.pow(pz, 1.3))

  ctx.globalCompositeOperation = 'source-over'
  const dark = isDark.value
  const darkTone = dark ? DARK : '220,225,235'
  const purpleDarkTone = dark ? PURPLE_DARK : '180,185,205'
  const rim = rimFor(pz)
  const base =
    pz < 0.45
      ? (p.red ? BLUE : purpleDarkTone)
      : pz < 0.75
        ? (p.red ? PURPLE : darkTone)
        : (p.red ? COLORS[p.tone] : darkTone)
  const sideBase = pz < 0.75 ? purpleDarkTone : darkTone
  const bright = 1 - far * 0.55 // atmospheric perspective

  // Front face: horizontal shading, lit from the foggy floor
  const fg = ctx.createLinearGradient(left, 0, left + w, 0)
  fg.addColorStop(0, `rgba(${base},${(0.55 * bright).toFixed(3)})`)
  fg.addColorStop(0.5, `rgba(${base},${(0.95 * bright).toFixed(3)})`)
  fg.addColorStop(1, `rgba(${base},${(0.7 * bright).toFixed(3)})`)
  ctx.fillStyle = fg
  ctx.fillRect(left, y0, w, h)

  // Side face (the one facing the vanishing point), noticeably darker
  const sideX = x < vx ? left + w : left - side
  const sg = ctx.createLinearGradient(sideX, 0, sideX + side, 0)
  const sideDark = x < vx ? [0.75, 0.95] : [0.95, 0.75]
  sg.addColorStop(0, `rgba(${sideBase},${(sideDark[0] * bright).toFixed(3)})`)
  sg.addColorStop(1, `rgba(${sideBase},${(sideDark[1] * bright).toFixed(3)})`)
  ctx.fillStyle = sg
  ctx.fillRect(sideX, y0, side, h)

  // Rim light on the edge shared by both faces
  const edgeX = x < vx ? left + w : left
  ctx.fillStyle = `rgba(${rim},${(0.4 * bright).toFixed(3)})`
  ctx.fillRect(edgeX - 1, y0, 2, h)

  // Vertical vignette: dark at the top, glowing at the base (fog light bouncing up)
  const vg = ctx.createLinearGradient(0, y0, 0, height)
  vg.addColorStop(0, `rgba(${darkTone},${(0.75 * bright).toFixed(3)})`)
  vg.addColorStop(0.55, `rgba(${darkTone},0)`)
  vg.addColorStop(1, `rgba(${rim},${(0.5 * bright).toFixed(3)})`)
  ctx.fillStyle = vg
  ctx.fillRect(Math.min(left, sideX), y0, w + side, h)

  // Haze: far pillars dissolve into the air
  if (far > 0.1) {
    ctx.fillStyle = `rgba(${hazeFor(pz)},${(far * 0.6).toFixed(3)})`
    ctx.fillRect(Math.min(left, sideX), y0, w + side, h)
  }

  // Contact shadow / glow at the base of the pillar
  const bg = ctx.createRadialGradient(x, height, 0, x, height, w * 1.4)
  bg.addColorStop(0, `rgba(${rim},${(0.35 * bright).toFixed(3)})`)
  bg.addColorStop(1, `rgba(${rim},0)`)
  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'
  ctx.fillStyle = bg
  ctx.fillRect(x - w * 1.4, height - w * 1.4, w * 2.8, w * 1.4)

  ctx.restore()
}

const drawFog = (bandIndex, time, dolly, yoff) => {
  const dark = isDark.value
  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'
  for (const f of fog) {
    if (f.band !== bandIndex) continue
    // Fog drifts sideways and parts around the cursor (near fog reacts more)
    const driftX = f.x + Math.sin(time * f.speed * 1.6 + f.phase) * 170 * f.depth
    const dx = driftX - mouse.sx
    const dy = f.y - mouse.sy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const reach = 280
    const target = dist < reach ? (1 - dist / reach) * 150 * f.depth * Math.sign(dx || 1) * mouse.strength : 0
    f.push += (target - f.push) * 0.05
    const x = driftX + f.push
    // Y axis: fog follows the camera bob with its own depth
    const y = f.y + Math.sin(time * f.speed * 1.4 + f.phase) * 20 * f.depth + yoff * f.depth

    // Elliptical blobs: wide and flat reads as ground mist
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1.8, 0.7)
    // Z axis: dolly makes near fog swell as the camera pushes forward
    const rr = f.r * (1 + dolly * 1.4 * f.depth)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr)
    const alphaFactor = dark ? 1 : 0.65
    g.addColorStop(0, `rgba(${f.color},${((0.16 + f.depth * 0.26) * alphaFactor).toFixed(3)})`)
    g.addColorStop(1, `rgba(${f.color},0)`)
    ctx.fillStyle = g
    ctx.fillRect(-rr, -rr, rr * 2, rr * 2)
    ctx.restore()
  }
}

const draw = (ms) => {
  if (!running || !isVisible) return
  const time = ms * 0.001
  ctx.clearRect(0, 0, width, height)

  mouse.sx += (mouse.x - mouse.sx) * 0.06
  mouse.sy += (mouse.y - mouse.sy) * 0.06
  mouse.snx += (mouse.nx - mouse.snx) * 0.06
  mouse.strength += ((mouse.active ? 1 : 0) - mouse.strength) * 0.04
  // Idle animation: the camera slowly drifts on its own; the cursor takes over smoothly
  const idleParallax = Math.sin(time * 0.18) * 60
  const idleVx = width * 0.55 + Math.sin(time * 0.13) * width * 0.1
  const cursorParallax = (0.5 - mouse.snx) * 130
  const cursorVx = width * 0.55 + (mouse.snx - 0.5) * width * 0.3
  const parallax = idleParallax + (cursorParallax - idleParallax) * mouse.strength
  const vx = idleVx + (cursorVx - idleVx) * mouse.strength

  // Y axis: slow vertical camera bob, cursor height tilts the view
  const cursorY = Math.max(0, Math.min(1, mouse.sy / height))
  const idleYoff = Math.sin(time * 0.22) * 26
  const cursorYoff = (0.5 - cursorY) * 90
  const yoff = idleYoff + (cursorYoff - idleYoff) * mouse.strength

  // Z axis: the camera slowly dollies forward and back through the pillars
  const dolly = Math.sin(time * 0.11) * 0.16 + Math.sin(time * 0.043 + 1.2) * 0.07

  // Each pillar also breathes in depth on its own, so the layers shift against each other
  const items = pillars
    .map((p) => ({
      p,
      pz: Math.max(0.1, Math.min(1.15, p.z + dolly * (0.6 + p.z) + Math.sin(time * 0.17 + p.phase) * 0.05))
    }))
    .sort((a, b) => a.pz - b.pz)

  drawBacklight(time)

  // Back-to-front: pillars of a depth band, then the fog living in front of that band
  BANDS.forEach(([from, to], bi) => {
    for (const { p, pz } of items) {
      if (pz >= from && pz < to) drawPillar(p, pz, time, parallax, vx, yoff)
    }
    drawFog(bi, time + bi * 5, dolly, yoff)
  })

  if (!reduceMotion && running && isVisible) raf = requestAnimationFrame(draw)
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMove)

  // Pause render loop when scrolled offscreen
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
.pillar-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
