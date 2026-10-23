<template>
  <v-tooltip
    v-bind="$attrs"
    :activator="activator"
    :location="location"
    :offset="offset"
    :open-delay="openDelay"
    :content-class="['v-overlay__content-glass-tooltip', contentClass].filter(Boolean).join(' ')"
  >
    <!-- Activator slot forwarding (if provided) -->
    <template v-if="$slots.activator" #activator="slotProps">
      <slot name="activator" v-bind="slotProps" />
    </template>

    <!-- Tooltip content -->
    <div
      class="glass-tooltip-wrapper"
      :style="{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }"
    >
      <div v-if="title" class="d-flex align-center ga-2 mb-1">
        <v-icon v-if="icon" size="13" :color="iconColor">{{ icon }}</v-icon>
        <span class="font-weight-bold text-white text-caption">{{ title }}</span>
      </div>

      <slot>
        <div class="d-flex align-center ga-2">
          <v-icon v-if="icon && !title" size="13" :color="iconColor">{{ icon }}</v-icon>
          <span class="glass-tooltip-text">{{ text }}</span>
        </div>
      </slot>
    </div>
  </v-tooltip>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  location: {
    type: String,
    default: 'top'
  },
  offset: {
    type: [Number, String],
    default: 8
  },
  openDelay: {
    type: [Number, String],
    default: 100
  },
  activator: {
    type: String,
    default: 'parent'
  },
  contentClass: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: [Number, String],
    default: 280
  }
})
</script>

<style lang="scss">
/* Premium Glassmorphic Tooltip Overlay (Global for Vuetify Overlays) */
.v-overlay__content.v-overlay__content-glass-tooltip,
.v-overlay__content.player-settings-tooltip {
  background: rgba(16, 17, 24, 0.96) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.75), 0 0 16px rgba(var(--v-theme-primary), 0.12) !important;
  border-radius: 10px !important;
  padding: 8px 12px !important;
  color: #ffffff !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  line-height: 1.45 !important;
  letter-spacing: 0.2px !important;
  text-align: left !important;
  pointer-events: none !important;

  .glass-tooltip-wrapper,
  .tooltip-body {
    font-size: 11px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.88);
  }

  .glass-tooltip-text {
    font-size: 11px;
    line-height: 1.45;
  }
}

.v-theme--light {
  &.v-overlay__content.v-overlay__content-glass-tooltip,
  .v-overlay__content.v-overlay__content-glass-tooltip,
  &.v-overlay__content.player-settings-tooltip,
  .v-overlay__content.player-settings-tooltip {
    background: rgba(255, 255, 255, 0.96) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.12) !important;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12), 0 0 12px rgba(var(--v-theme-primary), 0.1) !important;
    color: #0f172a !important;

    .glass-tooltip-wrapper,
    .tooltip-body,
    .glass-tooltip-text {
      color: #0f172a !important;
    }

    span.text-white {
      color: #0f172a !important;
    }
  }
}
</style>
