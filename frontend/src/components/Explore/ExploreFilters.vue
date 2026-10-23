<template>
  <div class="explore-filters">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="font-mono text-caption text-primary font-weight-bold text-uppercase">
        {{ $t('Explore.Filters.Title') }}
      </div>
      <v-btn
        id="explore-filters-reset"
        variant="text"
        size="small"
        density="comfortable"
        class="text-none"
        prepend-icon="mdi-filter-remove-outline"
        :disabled="!hasActive"
        @click="emit('reset')"
      >
        {{ $t('Explore.Filters.Reset') }}
      </v-btn>
    </div>

    <template v-if="loading">
      <v-skeleton-loader type="heading, chip@6, heading, chip@4, heading, text" class="bg-transparent" />
    </template>

    <template v-else>
      <!-- Genres -->
      <div class="text-subtitle-2 font-weight-bold text-high-emphasis mb-2">{{ $t('Explore.Filters.Genre') }}</div>
      <v-chip-group
        :model-value="modelValue.genres"
        multiple
        column
        filter
        selected-class="text-primary"
        class="mb-4"
        @update:model-value="patch({ genres: $event })"
      >
        <v-chip
          v-for="g in genreItems"
          :key="g.name"
          :value="g.name"
          size="small"
          variant="outlined"
        >
          {{ g.name }}
          <span v-if="g.count" class="ml-1 text-medium-emphasis">{{ g.count }}</span>
        </v-chip>
      </v-chip-group>
      <div v-if="!genreItems.length" class="text-caption text-medium-emphasis mb-4">{{ $t('Explore.Filters.NoOptions') }}</div>

      <!-- Moods -->
      <div class="text-subtitle-2 font-weight-bold text-high-emphasis mb-2">{{ $t('Explore.Filters.Mood') }}</div>
      <v-chip-group
        :model-value="modelValue.moods"
        multiple
        column
        filter
        selected-class="text-primary"
        class="mb-4"
        @update:model-value="patch({ moods: $event })"
      >
        <v-chip
          v-for="m in moodItems"
          :key="m.name"
          :value="m.name"
          size="small"
          variant="outlined"
        >
          {{ m.name }}
          <span v-if="m.count" class="ml-1 text-medium-emphasis">{{ m.count }}</span>
        </v-chip>
      </v-chip-group>
      <div v-if="!moodItems.length" class="text-caption text-medium-emphasis mb-4">{{ $t('Explore.Filters.NoOptions') }}</div>

      <v-divider class="mb-5" />

      <!-- Key -->
      <v-select
        id="explore-filter-key"
        :model-value="modelValue.key"
        :items="keyItems"
        :label="$t('Explore.Filters.Key')"
        :no-data-text="$t('Explore.Filters.NoOptions')"
        prepend-inner-icon="mdi-music-clef-treble"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        clearable
        hide-details
        class="mb-6"
        @update:model-value="patch({ key: $event || null })"
      />

      <!-- BPM -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-subtitle-2 font-weight-bold text-high-emphasis">{{ $t('Explore.Filters.Bpm') }}</span>
        <span class="font-mono text-caption text-medium-emphasis">{{ bpmValue[0] }} – {{ bpmValue[1] }}</span>
      </div>
      <v-range-slider
        id="explore-filter-bpm"
        :model-value="bpmValue"
        :min="bpmBounds[0]"
        :max="bpmBounds[1]"
        :step="1"
        :disabled="bpmBounds[0] === bpmBounds[1]"
        color="primary"
        track-color="rgba(var(--v-theme-on-surface), 0.12)"
        strict
        hide-details
        class="mb-5"
        @update:model-value="patch({ bpm: normalizeRange($event, bpmBounds) })"
      />

      <!-- Price (Basic license) -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-subtitle-2 font-weight-bold text-high-emphasis">
          {{ $t('Explore.Filters.Price') }}
          <v-icon size="14" class="ml-1 text-medium-emphasis">
            mdi-information-outline
          </v-icon>
          <GlassTooltip icon="mdi-tag-outline" :text="$t('Explore.Filters.PriceHint')" />
        </span>
        <span class="font-mono text-caption text-medium-emphasis">
          {{ currencyStore.formatPrice(priceValue[0]) }} – {{ currencyStore.formatPrice(priceValue[1]) }}
        </span>
      </div>
      <v-range-slider
        id="explore-filter-price"
        :model-value="priceValue"
        :min="priceBounds[0]"
        :max="priceBounds[1]"
        :step="1"
        :disabled="priceBounds[0] === priceBounds[1]"
        color="primary"
        track-color="rgba(var(--v-theme-on-surface), 0.12)"
        strict
        hide-details
        @update:model-value="patch({ price: normalizeRange($event, priceBounds) })"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCurrencyStore } from '@/stores/currencyStore'

const props = defineProps({
  /** { genres: string[], moods: string[], key: string|null, bpm: [n,n]|null, price: [n,n]|null } */
  modelValue: { type: Object, required: true },
  facets: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  bpmBounds: { type: Array, required: true },
  priceBounds: { type: Array, required: true },
  hasActive: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'reset'])
const currencyStore = useCurrencyStore()

const patch = (changes) => emit('update:modelValue', { ...props.modelValue, ...changes })

/** Facet options plus any selected value not present in them (e.g. coming from a shared URL). */
const withSelected = (options = [], selected = []) => {
  const known = new Set(options.map((o) => o.name.toLowerCase()))
  const extra = selected.filter((s) => !known.has(s.toLowerCase())).map((name) => ({ name, count: 0 }))
  return [...extra, ...options]
}

const genreItems = computed(() => withSelected(props.facets?.genres, props.modelValue.genres))
const moodItems = computed(() => withSelected(props.facets?.moods, props.modelValue.moods))
const keyItems = computed(() => (props.facets?.keys || []).map((k) => ({ title: `${k.name} (${k.count})`, value: k.name })))

const bpmValue = computed(() => props.modelValue.bpm || props.bpmBounds)
const priceValue = computed(() => props.modelValue.price || props.priceBounds)

/** A range covering the full bounds means "no filter". */
function normalizeRange(value, bounds) {
  const [lo, hi] = value.map((v) => Math.round(v))
  return lo <= bounds[0] && hi >= bounds[1] ? null : [lo, hi]
}
</script>
