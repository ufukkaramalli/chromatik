<template>
  <v-sheet
    color="transparent"
    class="d-flex align-center font-mono text-caption text-grey-lighten-2 position-relative cursor-pointer ga-1 flex-shrink-0"
  >
    <v-icon size="14" color="primary" class="flex-shrink-0">mdi-timer-sand</v-icon>
    <span class="countdown-display font-weight-bold text-white text-center">
      {{ timeRemaining.formatted }}
    </span>

    <GlassTooltip
      icon="mdi-clock-outline"
      :text="$t('Home.Landing.Hero.CountdownTooltip', { time: timeRemaining.formatted })"
    />
  </v-sheet>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timeRemaining = ref({
  hours: '00',
  minutes: '00',
  seconds: '00',
  formatted: '00:00:00'
})

let timer = null

function updateCountdown() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  const diff = Math.max(0, tomorrow.getTime() - now.getTime())

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const hStr = String(hours).padStart(2, '0')
  const mStr = String(minutes).padStart(2, '0')
  const sStr = String(seconds).padStart(2, '0')

  timeRemaining.value = {
    hours: hStr,
    minutes: mStr,
    seconds: sStr,
    formatted: `${hStr}:${mStr}:${sStr}`
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.countdown-display {
  font-size: 0.78rem;
  display: inline-block;
  width: 62px;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  letter-spacing: 0.04em;
  user-select: none;
}
</style>
