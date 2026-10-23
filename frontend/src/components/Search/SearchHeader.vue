<template>
  <header class="text-center mb-6 mb-md-8 mx-auto position-relative" style="max-width: 760px;">
    <!-- Ambient glow (decorative) -->
    <div class="search-glow" aria-hidden="true"></div>

    <v-chip
      size="small"
      variant="tonal"
      color="primary"
      class="font-mono font-weight-bold text-uppercase mb-4"
      prepend-icon="mdi-magnify"
    >
      {{ $t('Search.Badge') }}
    </v-chip>

    <h1 class="text-h4 text-md-h3 font-weight-black text-high-emphasis mb-4">
      <template v-if="cleanQuery">
        {{ $t('Search.TitleWithQuery', { query: cleanQuery }) }}
      </template>
      <template v-else>
        {{ $t('Search.TitleEmpty') }}
      </template>
    </h1>

    <!-- Search input box -->
    <v-text-field
      id="search-page-input"
      :model-value="modelValue"
      :placeholder="$t('Search.Placeholder')"
      prepend-inner-icon="mdi-magnify"
      clearable
      variant="solo"
      flat
      rounded="pill"
      density="comfortable"
      hide-details
      class="search-main-field mb-4"
      @update:model-value="$emit('update:modelValue', $event)"
      @keyup.enter="$emit('enter')"
    >
      <template #append-inner>
        <v-btn
          v-if="cleanQuery"
          :to="{ name: 'Explore', query: { q: cleanQuery } }"
          variant="text"
          size="small"
          class="text-none font-weight-bold mr-1 d-none d-sm-flex text-medium-emphasis"
          prepend-icon="mdi-tune-variant"
        >
          {{ $t('Search.AdvancedFilters') }}
          <GlassTooltip icon="mdi-tune-variant" :text="$t('Search.AdvancedFiltersHint')" />
        </v-btn>
      </template>
    </v-text-field>

    <!-- Quick Trending Suggestions -->
    <div class="d-flex align-center justify-center flex-wrap ga-2">
      <span class="text-caption text-grey mr-1">{{ $t('Search.Trending') }}:</span>
      <v-chip
        v-for="tag in trendingTags"
        :key="tag"
        size="small"
        variant="tonal"
        class="cursor-pointer"
        @click="$emit('select-tag', tag)"
      >
        {{ tag }}
      </v-chip>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  cleanQuery: string
  trendingTags: string[]
}>()

defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'enter'): void
  (e: 'select-tag', tag: string): void
}>()
</script>

<style scoped lang="scss">
.search-glow {
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

.search-main-field :deep(.v-field) {
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
  transition: box-shadow 0.25s ease;

  .v-theme--light & {
    box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.08);
  }
}

.search-main-field :deep(.v-field--focused) {
  box-shadow: 0 12px 40px -8px rgba(var(--v-theme-primary), 0.35), 0 0 0 1.5px rgba(var(--v-theme-primary), 0.8) !important;
}
</style>
