<template>
  <section :id="id" :class="['editorial-showcase-section', sectionClass]">
    <v-row :no-gutters="consolePosition === 'none'" align="stretch">
      <!-- Editorial Console Column -->
      <v-col
        v-if="consolePosition !== 'none'"
        cols="12"
        md="4"
        lg="3"
        :class="[
          'mb-4 mb-md-0 d-flex flex-column',
          consolePosition === 'right' ? 'order-1 order-md-2' : ''
        ]"
      >
        <v-card
          class="sharp-editorial-console rounded-2xl pa-6 d-flex flex-column justify-space-between flex-grow-1 position-relative overflow-hidden"
          elevation="4"
          border
          color="surface"
          :style="consoleCardStyle"
        >
          <div class="console-ambient-bloom" :style="bloomStyle" aria-hidden="true"></div>

          <div class="position-relative z-1">
            <!-- Header bar (Index Tag & Header Icon) -->
            <div class="d-flex align-center justify-space-between mb-4">
              <span class="tech-index-tag font-mono text-caption text-medium-emphasis font-weight-bold">
                {{ indexTag }}
              </span>
              <v-icon size="16" :color="color">{{ headerIcon }}</v-icon>
            </div>

            <!-- Badge Chip -->
            <v-chip
              :size="badgeSize"
              :variant="badgeVariant"
              :color="badgeColor || color"
              class="mb-4 font-mono font-weight-bold text-uppercase"
              :prepend-icon="badgeIcon || undefined"
            >
              {{ badge }}
            </v-chip>

            <!-- Title -->
            <h3 class="text-h4 font-display font-weight-black text-high-emphasis mb-3 tracking-tight">
              {{ title }}
            </h3>

            <!-- Description -->
            <p class="text-body-2 text-medium-emphasis mb-6 font-body line-height-relaxed">
              {{ description }}
            </p>
          </div>

          <!-- Bottom Console Area (Widget & Action) -->
          <div class="position-relative z-1 pt-4 border-t">
            <!-- Custom Widget Slot (or default Sound Wave Bars / Dual Trace Oscilloscope) -->
            <slot name="console-widget">
              <!-- Left Console: Dynamic Spectrogram Heatmap Ribbon (Full Width w-100) -->
              <div
                v-if="consolePosition === 'left' && soundBars"
                class="spectrogram-container w-100 mb-4 position-relative overflow-hidden rounded-lg pa-1 d-flex align-center"
                :style="spectrogramContainerStyle"
              >
                <!-- Live Ingestion Sweep Curtain -->
                <div class="spectro-sweep" :style="spectroSweepStyle" aria-hidden="true"></div>

                <!-- Frequency Markers (20k, 1k, 60) -->
                <div
                  class="spectro-freq-labels font-mono position-absolute d-flex flex-column justify-space-between"
                  :style="spectroFreqLabelsStyle"
                  aria-hidden="true"
                >
                  <span>20k</span>
                  <span>1k</span>
                  <span>60</span>
                </div>

                <!-- Telemetry Tag -->
                <div class="spectro-telemetry-tag font-mono position-absolute" :style="spectroTelemetryStyle">
                  SPEC // SPECTROGRAM
                </div>

                <svg
                  class="spectrogram-svg w-100"
                  viewBox="0 0 320 42"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient :id="`spectro-low-${componentUid}`" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" :stop-color="color" stop-opacity="0.30" />
                      <stop offset="100%" :stop-color="color" stop-opacity="0.05" />
                    </linearGradient>
                    <linearGradient :id="`spectro-mid-${componentUid}`" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" :stop-color="color" stop-opacity="0.55" />
                      <stop offset="100%" :stop-color="color" stop-opacity="0.10" />
                    </linearGradient>
                    <radialGradient :id="`spectro-node-${componentUid}`" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
                      <stop offset="45%" :stop-color="color" stop-opacity="0.9" />
                      <stop offset="100%" :stop-color="color" stop-opacity="0" />
                    </radialGradient>
                  </defs>

                  <!-- Horizontal Frequency Division Lines -->
                  <line
                    x1="24"
                    y1="14"
                    x2="320"
                    y2="14"
                    :stroke="color"
                    stroke-opacity="0.12"
                    stroke-dasharray="3 4"
                    stroke-width="1"
                  />
                  <line
                    x1="24"
                    y1="28"
                    x2="320"
                    y2="28"
                    :stroke="color"
                    stroke-opacity="0.12"
                    stroke-dasharray="3 4"
                    stroke-width="1"
                  />

                  <!-- Layer 1: Sub/Low Harmonic Mass (Slow Wave Flow, 160px period) -->
                  <g class="spectro-layer-low">
                    <path
                      d="M -160 42 L -160 26 Q -120 18, -80 28 T 0 24 T 80 30 T 160 24 T 240 30 T 320 24 T 400 30 T 480 24 L 480 42 Z"
                      :fill="`url(#spectro-low-${componentUid})`"
                    />
                  </g>

                  <!-- Layer 2: Mid Harmonic Resonance (Medium Undulation, 120px period) -->
                  <g class="spectro-layer-mid">
                    <path
                      d="M -120 42 L -120 16 Q -90 8, -60 20 T 0 14 T 60 22 T 120 14 T 180 22 T 240 14 T 300 22 T 360 14 T 420 22 T 480 14 L 480 42 Z"
                      :fill="`url(#spectro-mid-${componentUid})`"
                    />
                  </g>

                  <!-- Layer 3: High Frequency Ridge & Transient Contour (Rapid Shimmer, 80px period) -->
                  <g class="spectro-layer-high">
                    <path
                      d="M -80 12 Q -60 4, -40 14 T 0 8 T 40 16 T 80 8 T 120 16 T 160 8 T 200 16 T 240 8 T 280 16 T 320 8 T 360 16 T 400 8"
                      fill="none"
                      :stroke="color"
                      stroke-width="2"
                      stroke-linecap="round"
                      :style="{ filter: `drop-shadow(0 0 5px ${color})` }"
                    />
                  </g>

                  <!-- Heatmap Energy Hotspots / Transient Flux Nodes -->
                  <circle
                    cx="72"
                    cy="14"
                    r="4"
                    :fill="`url(#spectro-node-${componentUid})`"
                    class="spectro-heat-node node-a"
                  />
                  <circle
                    cx="165"
                    cy="20"
                    r="5"
                    :fill="`url(#spectro-node-${componentUid})`"
                    class="spectro-heat-node node-b"
                  />
                  <circle
                    cx="255"
                    cy="12"
                    r="4.5"
                    :fill="`url(#spectro-node-${componentUid})`"
                    class="spectro-heat-node node-c"
                  />
                </svg>
              </div>

              <!-- Right Console: Dual Synth Trace (Sine & Saw Cathode Oscilloscope) (Full Width w-100) -->
              <div
                v-else-if="consolePosition === 'right' && soundBars"
                class="oscilloscope-container w-100 mb-4 position-relative overflow-hidden rounded-lg pa-1 d-flex align-center"
                :style="oscilloscopeContainerStyle"
              >
                <div class="cathode-scanline" :style="cathodeScanStyle" aria-hidden="true"></div>
                <div class="osc-telemetry-tag font-mono position-absolute" :style="oscTelemetryStyle">
                  OSC // SINE+SAW
                </div>

                <svg
                  class="oscilloscope-svg w-100"
                  viewBox="0 0 320 40"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <!-- Baseline Center Axis -->
                  <line
                    x1="0"
                    y1="20"
                    x2="320"
                    y2="20"
                    :stroke="color"
                    stroke-opacity="0.15"
                    stroke-dasharray="4 4"
                    stroke-width="1"
                  />

                  <!-- Layer 1: Harmonics Sine Wave -->
                  <g class="osc-sine-track">
                    <path
                      d="M -80 20 Q -60 8, -40 20 T 0 20 T 40 20 T 80 20 T 120 20 T 160 20 T 200 20 T 240 20 T 280 20 T 320 20 T 360 20 T 400 20"
                      fill="none"
                      :stroke="color"
                      stroke-opacity="0.45"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </g>

                  <!-- Layer 2: Aggressive Sawtooth Wave -->
                  <g class="osc-saw-track">
                    <path
                      d="M -64 32 L 0 8 L 0 32 L 64 8 L 64 32 L 128 8 L 128 32 L 192 8 L 192 32 L 256 8 L 256 32 L 320 8 L 320 32 L 384 8 L 384 32"
                      fill="none"
                      :stroke="color"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :style="{ filter: `drop-shadow(0 0 4px ${color}99)` }"
                    />
                  </g>
                </svg>
              </div>
            </slot>

            <!-- Action Status Row -->
            <div class="font-mono text-caption text-medium-emphasis font-weight-bold text-uppercase tracking-wider">
              <v-icon size="14" :color="color" class="mr-1">{{ actionIcon }}</v-icon>
              {{ actionText }}
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Playlist Column -->
      <v-col
        cols="12"
        :md="consolePosition === 'none' ? 12 : 8"
        :lg="consolePosition === 'none' ? 12 : 9"
        :class="[
          consolePosition === 'none' ? 'pa-0' : '',
          consolePosition === 'right' ? 'order-2 order-md-1' : ''
        ]"
      >
        <Playlist
          :tracks="tracks"
          :loading="loading"
          :icon="playlistIcon"
          :icon-color="color"
          :title="playlistTitle"
          :subtitle="playlistSubtitle"
          :align="computedPlaylistAlign"
          v-bind="$attrs"
        >
          <template #title>
            <slot name="title">
              <div v-if="consolePosition === 'none' && (indexTag || badge)" class="d-flex flex-column">
                <div class="d-flex align-center ga-2 mb-1">
                  <span
                    v-if="indexTag"
                    class="font-mono text-caption font-weight-bold tracking-widest text-uppercase"
                    :class="indexTagClass"
                    :style="indexTagStyle"
                  >
                    {{ indexTag }}
                  </span>
                  <v-chip
                    v-if="badge"
                    :size="badgeSize"
                    :variant="badgeVariant"
                    :color="badgeColor || color"
                    class="font-mono font-weight-bold text-uppercase"
                  >
                    <v-icon v-if="badgeIcon" start size="12">{{ badgeIcon }}</v-icon>
                    {{ badge }}
                  </v-chip>
                </div>
                <h2 class="playlist-section-title font-display text-truncate">{{ playlistTitle }}</h2>
              </div>
              <h2
                v-else
                class="playlist-section-title font-display text-truncate"
                :class="computedPlaylistAlign === 'right' ? 'text-right' : ''"
              >
                {{ playlistTitle }}
              </h2>
            </slot>
          </template>

          <template #subtitle>
            <slot name="subtitle">
              <span class="playlist-badge font-mono">
                <span class="live-dot" :style="liveDotStyle" aria-hidden="true"></span>
                {{ playlistSubtitle }}
              </span>
              <span v-if="subtitleDetail" class="text-caption font-mono text-grey-lighten-2 ml-2 d-none d-sm-inline">
                • {{ subtitleDetail }}
              </span>
            </slot>
          </template>
        </Playlist>
      </v-col>
    </v-row>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppTheme } from '@/composables/useAppTheme'
import Playlist from '@/components/Audio/Playlist.vue'

const { isDark } = useAppTheme()

const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
  sectionClass: {
    type: String,
    default: 'mb-16 mb-md-24'
  },
  consolePosition: {
    type: String,
    default: 'left', // 'left' | 'right' | 'none'
    validator: (v) => ['left', 'right', 'none'].includes(v)
  },
  color: {
    type: String,
    default: '#D500F9'
  },
  badgeColor: {
    type: String,
    default: ''
  },
  badgeIcon: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  badgeVariant: {
    type: String,
    default: 'tonal'
  },
  badgeSize: {
    type: String,
    default: 'small'
  },
  indexTag: {
    type: String,
    default: ''
  },
  indexTagColor: {
    type: String,
    default: ''
  },
  headerIcon: {
    type: String,
    default: 'mdi-pulse'
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: 'mdi-broadcast'
  },
  actionText: {
    type: String,
    default: ''
  },
  soundBars: {
    type: Boolean,
    default: true
  },
  tracks: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  playlistIcon: {
    type: String,
    default: 'mdi-chart-line-variant'
  },
  playlistTitle: {
    type: String,
    default: ''
  },
  playlistSubtitle: {
    type: String,
    default: ''
  },
  subtitleDetail: {
    type: String,
    default: ''
  },
  playlistAlign: {
    type: String,
    default: undefined,
    validator: (v) => !v || ['left', 'right'].includes(v)
  }
})

const computedPlaylistAlign = computed(() => {
  if (props.playlistAlign) return props.playlistAlign
  return props.consolePosition === 'right' ? 'right' : 'left'
})

const consoleCardStyle = computed(() => ({
  borderTop: `2.5px solid ${props.color} !important`
}))

const bloomStyle = computed(() => {
  const hex = props.color.startsWith('#') ? props.color : '#D500F9'
  return {
    background: `radial-gradient(circle, ${hex}40 0%, transparent 70%)`,
    opacity: isDark.value ? 0.35 : 0.15
  }
})

const liveDotStyle = computed(() => {
  if (props.color) {
    const isNamed = !props.color.startsWith('#') && !props.color.startsWith('rgb')
    const resolvedColor = isNamed ? `var(--v-theme-${props.color})` : props.color
    return {
      backgroundColor: resolvedColor,
      boxShadow: `0 0 8px ${resolvedColor}`
    }
  }
  return {}
})

const indexTagClass = computed(() => {
  if (props.indexTagColor) {
    return props.indexTagColor.startsWith('#') ? '' : `text-${props.indexTagColor}`
  }
  return ''
})

const indexTagStyle = computed(() => {
  const targetColor = props.indexTagColor || props.color
  const style = { fontSize: '0.72rem !important' }
  if (targetColor && targetColor.startsWith('#')) {
    style.color = `${targetColor} !important`
  }
  return style
})

const oscilloscopeContainerStyle = computed(() => {
  const hex = props.color.startsWith('#') ? props.color : '#FF3D00'
  return {
    height: '42px',
    backgroundColor: isDark.value ? '#09070c' : 'rgba(0, 0, 0, 0.04)',
    border: `1px solid ${hex}40`
  }
})

const cathodeScanStyle = computed(() => {
  const hex = props.color.startsWith('#') ? props.color : '#FF3D00'
  return {
    background: `linear-gradient(90deg, transparent 0%, ${hex}35 50%, transparent 100%)`
  }
})

const oscTelemetryStyle = computed(() => {
  return {
    top: '3px',
    right: '6px',
    fontSize: '0.55rem',
    letterSpacing: '0.12em',
    color: props.color,
    opacity: 0.75,
    pointerEvents: 'none'
  }
})

const componentUid = Math.random().toString(36).substring(2, 7)

const spectrogramContainerStyle = computed(() => {
  const hex = props.color.startsWith('#') ? props.color : '#D500F9'
  return {
    height: '42px',
    backgroundColor: isDark.value ? '#07050a' : 'rgba(0, 0, 0, 0.04)',
    border: `1px solid ${hex}40`
  }
})

const spectroSweepStyle = computed(() => {
  const hex = props.color.startsWith('#') ? props.color : '#D500F9'
  return {
    background: `linear-gradient(90deg, transparent 0%, ${hex}30 50%, transparent 100%)`
  }
})

const spectroTelemetryStyle = computed(() => ({
  top: '3px',
  right: '6px',
  fontSize: '0.55rem',
  letterSpacing: '0.12em',
  color: props.color,
  opacity: 0.75,
  pointerEvents: 'none'
}))

const spectroFreqLabelsStyle = computed(() => ({
  left: '6px',
  top: '3px',
  bottom: '3px',
  fontSize: '0.50rem',
  letterSpacing: '0.04em',
  lineHeight: '1',
  color: props.color,
  opacity: 0.5,
  pointerEvents: 'none'
}))
</script>

<style lang="scss" scoped>
.sharp-editorial-console {
  backdrop-filter: blur(20px);

  .v-theme--light & {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px -4px rgba(0, 0, 0, 0.04) !important;
  }
}

.console-ambient-bloom {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 220px;
  height: 220px;
  filter: blur(40px);
  pointer-events: none;

  .v-theme--light & {
    display: none !important;
  }
}

.tech-index-tag {
  letter-spacing: 0.12em;
  opacity: 0.6;
}

.spectrogram-container {
  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.85);

  .spectrogram-svg {
    height: 100%;
    overflow: visible;
  }
}

.spectro-sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 70px;
  pointer-events: none;
  z-index: 1;
  animation: spectro-sweep-anim 3.2s linear infinite;
}

.spectro-layer-low {
  animation: spectro-drift-low 6s linear infinite;
}

.spectro-layer-mid {
  animation: spectro-drift-mid 4s linear infinite;
}

.spectro-layer-high {
  animation: spectro-drift-high 2.2s linear infinite;
}

.spectro-heat-node {
  transform-origin: center;
  transform-box: fill-box;
  animation: spectro-node-pulse 2s ease-in-out infinite alternate;

  &.node-a {
    animation-delay: 0.1s;
    animation-duration: 1.8s;
  }
  &.node-b {
    animation-delay: 0.6s;
    animation-duration: 2.3s;
  }
  &.node-c {
    animation-delay: 1.1s;
    animation-duration: 1.6s;
  }
}

@keyframes spectro-sweep-anim {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(450px);
  }
}

@keyframes spectro-drift-low {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-160px);
  }
}

@keyframes spectro-drift-mid {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-120px);
  }
}

@keyframes spectro-drift-high {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-80px);
  }
}

@keyframes spectro-node-pulse {
  0% {
    transform: scale(0.7);
    opacity: 0.35;
  }
  100% {
    transform: scale(1.35);
    opacity: 1;
  }
}

.oscilloscope-container {
  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.85);

  .oscilloscope-svg {
    height: 100%;
    overflow: visible;
  }
}

.cathode-scanline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  pointer-events: none;
  z-index: 1;
  animation: cathode-sweep 2.8s linear infinite;
}

.osc-sine-track {
  animation: osc-drift-sine 2.4s linear infinite;
}

.osc-saw-track {
  animation: osc-drift-saw 1.8s linear infinite;
}

@keyframes cathode-sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(450px);
  }
}

@keyframes osc-drift-sine {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-80px);
  }
}

@keyframes osc-drift-saw {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-64px);
  }
}

.font-display {
  font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif !important;
}

.font-body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
}

.font-mono {
  font-family: 'Space Grotesk', monospace, sans-serif !important;
}

.playlist-section-title {
  font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif !important;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));

  @media (min-width: 960px) {
    font-size: 1.75rem;
  }
}

.playlist-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  color: rgba(var(--v-theme-on-surface), 0.85);

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--v-theme-primary);
    box-shadow: 0 0 8px var(--v-theme-primary);
    animation: beacon-pulse 2s infinite ease-in-out;
  }
}

@keyframes beacon-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}
</style>
