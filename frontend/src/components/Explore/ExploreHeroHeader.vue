<template>
  <header class="text-center mb-8 mb-md-10 position-relative">
    <!-- Ambient glow (decorative) -->
    <div class="explore-glow" aria-hidden="true"></div>

    <v-chip
      size="small"
      variant="tonal"
      color="primary"
      class="font-mono font-weight-bold text-uppercase mb-4"
      prepend-icon="mdi-compass-outline"
    >
      {{ $t('Explore.Badge') }}
    </v-chip>
    <h1 class="text-h4 text-md-h3 font-weight-black text-high-emphasis mb-3">
      {{ $t('Explore.Title') }}
    </h1>
    <p class="text-body-1 text-medium-emphasis mx-auto mb-0" style="max-width: 680px;">
      {{ $t('Explore.Subtitle') }}
    </p>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.explore-glow {
  position: absolute;
  top: -180px;
  left: 50%;
  width: 900px;
  height: 480px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at center, rgba(var(--v-theme-primary), 0.22), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}
</style>
