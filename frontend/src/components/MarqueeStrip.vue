<template>
  <v-sheet
    class="kinetic-laser-strip position-relative overflow-hidden w-100"
    :border="border"
    :color="color"
  >
    <div
      class="marquee-track"
      :class="{ 'pause-on-hover': pauseOnHover, 'reverse-scroll': reverse }"
      :style="{ animationDuration: `${duration}s` }"
    >
      <div
        v-for="copy in repeat"
        :key="copy"
        class="marquee-content d-flex align-center ga-8 py-3 px-4 font-mono text-caption font-weight-bold text-uppercase tracking-widest text-medium-emphasis"
        :aria-hidden="copy > 1 ? 'true' : undefined"
      >
        <slot>
          <span
            v-for="(item, idx) in normalizedItems"
            :key="idx"
            class="d-flex align-center"
            :class="item.primary ? 'text-primary' : 'text-high-emphasis'"
          >
            <v-icon
              :size="item.iconSize || 12"
              :color="item.primary ? 'primary' : 'medium-emphasis'"
              class="mr-2"
            >
              {{ item.icon || 'mdi-rhombus' }}
            </v-icon>
            {{ item.text }}
          </span>
        </slot>
      </div>
    </div>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  duration: {
    type: [Number, String],
    default: 45
  },
  repeat: {
    type: Number,
    default: 4
  },
  pauseOnHover: {
    type: Boolean,
    default: true
  },
  reverse: {
    type: Boolean,
    default: false
  },
  border: {
    type: [Boolean, String],
    default: 't b'
  },
  color: {
    type: String,
    default: undefined
  }
})

const normalizedItems = computed(() => {
  return props.items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        text: item,
        primary: index % 2 === 0,
        icon: 'mdi-rhombus',
        iconSize: 12
      }
    }
    return {
      text: item.text || '',
      primary: item.primary ?? (index % 2 === 0),
      icon: item.icon || 'mdi-rhombus',
      iconSize: item.iconSize || 12
    }
  })
})
</script>

<style lang="scss" scoped>
.kinetic-laser-strip {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), 0.65);
  border-color: rgba(var(--v-theme-primary), 0.25) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  user-select: none;
}

.marquee-track {
  display: flex;
  width: max-content;
  flex-wrap: nowrap;
  will-change: transform;
  animation-name: marquee-scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;

  &.pause-on-hover:hover {
    animation-play-state: paused;
  }

  &.reverse-scroll {
    animation-direction: reverse;
  }
}

.marquee-content {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
}

@keyframes marquee-scroll {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
