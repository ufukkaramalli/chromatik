<template>
  <v-row>
    <v-col cols="12" class="pa-0">
        <canvas class="canvas" ref="analyser"></canvas>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useVisualizer } from '@/composables/useVisualizer'

const analyser = ref<HTMLCanvasElement | null>(null)
// The composable handles mounting, unmounting, drawing, and resizing
useVisualizer(analyser)
</script>
<style lang="scss">
  .canvas{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    width: 100%;
  }
</style>
