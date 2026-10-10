<template>
  <component :is="tag" :class="className">
    <span 
      v-for="(char, index) in characters" 
      :key="index"
      class="glitch-char"
      ref="charRefs"
      :style="{ display: char === ' ' ? 'inline' : 'inline-block' }"
    >
      {{ char === ' ' ? '&nbsp;' : char }}
    </span>
  </component>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: 'h1'
  },
  className: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'default'
  }
})

const characters = ref([])
const charRefs = ref([])
let timeoutId = null

watch(() => props.text, (newText) => {
  characters.value = newText ? newText.split('') : []
}, { immediate: true })

const getRandomNumber = (min, max) => (Math.random() * (max - min) + min)

const getThemeColors = () => {
  if (props.theme === 'pillars') {
    return ['#3296ff', '#8c37c8', '#0a5adc'] // Light Blue, Purple, Deep Blue
  } else if (props.theme === 'flowfield') {
    return ['#ff5252', '#d32f2f', '#ffffff'] // Primary Red, Dark Red, White (Halftone dots effect)
  } else {
    // default ribbons (WaveField) theme
    return ['#ff5252', '#d32f2f', '#9a0007'] // Primary Red, Dark Red, Deepest Red
  }
}

const applyGlitch = (el, cycles) => {
  if (cycles === 0 || cycles > 3) return
  
  const colors = getThemeColors()
  
  // Apply random translation and color
  el.style.transform = `translate(${getRandomNumber(-8, 8)}px, ${getRandomNumber(-8, 8)}px)`
  el.style.color = colors[cycles - 1]
  el.style.textShadow = `0 0 15px ${colors[cycles - 1]}`
  
  setTimeout(() => {
    // Reset styles
    el.style.transform = ''
    el.style.color = ''
    el.style.textShadow = ''
    applyGlitch(el, cycles - 1)
  }, getRandomNumber(20, 80))
}

const loop = () => {
  timeoutId = setTimeout(() => {
    if (charRefs.value && charRefs.value.length > 0) {
      const validIndices = []
      characters.value.forEach((c, i) => {
        if (c !== ' ') validIndices.push(i)
      })
      
      if (validIndices.length > 0) {
        // Shuffle valid indices
        const shuffled = validIndices.sort(() => 0.5 - Math.random())
        
        // Pick random number of letters to glitch (between 1 and 3, but not more than total chars)
        const numToGlitch = Math.floor(getRandomNumber(1, Math.min(4, shuffled.length + 1)))
        const selectedIndices = shuffled.slice(0, numToGlitch)
        
        selectedIndices.forEach(idx => {
          const el = charRefs.value[idx]
          if (el) {
            applyGlitch(el, 3)
          }
        })
      }
    }
    loop()
  }, getRandomNumber(1000, 3500))
}

onMounted(() => {
  nextTick(() => {
    loop()
  })
})

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<style scoped>
.glitch-char {
  transition: transform 0.05s linear, color 0.05s linear, text-shadow 0.05s linear;
  position: relative;
  /* Will-change helps with rendering performance during rapid transforms */
  will-change: transform, color, text-shadow;
}
</style>
