<template>
  <v-chip
    size="small"
    variant="tonal"
    color="primary"
    rounded="pill"
    border
    class="font-mono text-caption font-weight-bold text-uppercase tracking-wider px-3"
  >
    <v-badge dot color="primary" inline class="mr-1" />
    <v-icon size="14" color="primary" class="mr-1">mdi-star-four-points</v-icon>
    <span>{{ label || $t('Home.Landing.Hero.TrackOfTheDay') }}</span>
  </v-chip>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  }
})
</script>
