<template>
  <v-sheet
    rounded="xl"
    border
    color="surface"
    class="pa-8 pa-md-12 text-center mx-auto my-6"
    style="max-width: 800px;"
  >
    <v-icon size="64" color="primary" class="mb-4">mdi-compass-outline</v-icon>
    <div class="text-h5 font-weight-bold text-high-emphasis mb-2">{{ $t('Search.InitialPromptTitle') }}</div>
    <div class="text-body-2 text-medium-emphasis mx-auto mb-6" style="max-width: 520px;">
      {{ $t('Search.InitialPromptDesc') }}
    </div>
    <div class="d-flex justify-center ga-3 flex-wrap">
      <v-btn
        :to="{ name: 'Explore' }"
        color="primary"
        rounded="pill"
        class="text-none font-weight-bold px-6"
        prepend-icon="mdi-compass"
      >
        {{ $t('Search.BrowseExplore') }}
      </v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
</script>
