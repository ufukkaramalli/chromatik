<template>
  <v-sheet rounded="xl" border color="#121018" class="pa-10 text-center">
    <v-icon size="48" color="grey" class="mb-4">{{ icon }}</v-icon>
    <div class="text-h6 font-weight-bold text-white mb-2">{{ title }}</div>
    <div class="text-body-2 text-grey-lighten-1 mx-auto" style="max-width: 420px;">{{ text }}</div>
    <slot />
  </v-sheet>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'mdi-magnify-close' },
  title: { type: String, default: '' },
  text: { type: String, default: '' }
})
</script>
