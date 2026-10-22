<template>
  <div
    class="laser-divider-container d-flex align-center position-relative w-100"
    :class="containerClass"
  >
    <!-- Left Divider -->
    <v-divider :color="color" :class="`border-opacity-${opacity}`" />

    <!-- Center Node (Icon, Chip Label or Custom Slot) -->
    <div class="laser-divider-node position-relative d-flex align-center justify-center mx-4 flex-shrink-0">
      <div v-if="glow" class="laser-divider-glow" :style="glowStyle" aria-hidden="true"></div>

      <slot>
        <v-chip
          v-if="label"
          size="x-small"
          variant="tonal"
          :color="color"
          rounded="pill"
          border
          class="font-mono font-weight-bold text-uppercase px-3"
        >
          <v-icon v-if="icon" :size="iconSize" :color="color" class="mr-1">{{ icon }}</v-icon>
          <span>{{ label }}</span>
        </v-chip>
        <v-icon v-else :size="iconSize" :color="color">{{ icon }}</v-icon>
      </slot>
    </div>

    <!-- Right Divider -->
    <v-divider :color="color" :class="`border-opacity-${opacity}`" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-rhombus'
  },
  iconSize: {
    type: [Number, String],
    default: 14
  },
  color: {
    type: String,
    default: 'primary'
  },
  opacity: {
    type: [Number, String],
    default: '25'
  },
  label: {
    type: String,
    default: ''
  },
  glow: {
    type: Boolean,
    default: true
  },
  containerClass: {
    type: String,
    default: 'my-16 my-md-24'
  }
})

const glowStyle = computed(() => ({
  background: props.color.startsWith('#')
    ? props.color
    : `rgba(var(--v-theme-${props.color}), 0.8)`
}))
</script>

<style lang="scss" scoped>
.laser-divider-container {
  user-select: none;
}

.laser-divider-node {
  z-index: 1;
}

.laser-divider-glow {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.45;
  pointer-events: none;
}
</style>
