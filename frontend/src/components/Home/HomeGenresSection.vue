<template>
  <section class="popular-genres-section mb-16 mb-md-24 position-relative">
    <!-- Centered Header Section -->
    <div class="text-center mb-10 d-flex flex-column align-center">
      <v-chip
        size="small"
        variant="tonal"
        color="primary"
        class="font-mono text-caption font-weight-bold text-uppercase tracking-widest mb-3"
        prepend-icon="mdi-music-box-multiple-outline"
      >
        {{ $t('Home.Landing.Genres.Badge') }}
      </v-chip>
      <h2 class="text-h3 font-display font-weight-black text-high-emphasis mb-2 tracking-tight">
        {{ $t('Home.Landing.Genres.Title') }}
      </h2>
      <p class="text-body-1 font-body text-medium-emphasis mb-0" style="max-width: 640px; line-height: 1.6;">
        {{ $t('Home.Landing.Genres.Subtitle') }}
      </p>
    </div>

    <v-row>
      <v-col
        v-for="genre in genreItems"
        :key="genre.name"
        cols="6"
        sm="4"
        md="3"
        lg="auto"
        class="flex-grow-1"
      >
        <v-card
          color="surface"
          rounded="2xl"
          class="genre-cyber-card pa-5 d-flex flex-column justify-space-between h-100 position-relative overflow-hidden cursor-pointer"
          elevation="4"
          border
          :style="{ '--genre-color': genre.color }"
          @click="$emit('select-genre', genre.name)"
        >
          <div
            class="genre-card-bloom"
            :style="{ background: `radial-gradient(circle, ${genre.color}40 0%, transparent 70%)` }"
            aria-hidden="true"
          ></div>

          <!-- Top: Avatar Icon & Launch Arrow -->
          <div class="d-flex align-center justify-space-between mb-5 position-relative z-1">
            <v-avatar
              size="42"
              rounded="xl"
              class="genre-avatar"
              :style="{
                background: `${genre.color}15`,
                border: `1.5px solid ${genre.color}40`
              }"
            >
              <v-icon size="22" :style="{ color: genre.color }">{{ genre.icon }}</v-icon>
            </v-avatar>
            <div class="genre-arrow-wrap">
              <v-icon size="16" class="text-medium-emphasis genre-arrow">mdi-arrow-top-right</v-icon>
            </div>
          </div>

          <!-- Bottom: Genre Name & Spec / Sound Characteristic -->
          <div class="position-relative z-1">
            <h3 class="text-body-1 font-display font-weight-black text-high-emphasis mb-1 tracking-tight">
              {{ genre.name }}
            </h3>
            <div
              class="d-flex align-center ga-1 font-mono text-caption text-truncate mb-1"
              :style="{ color: genre.color, fontSize: '0.72rem !important' }"
            >
              <span class="font-weight-bold">{{ genre.spec }}</span>
            </div>
            <div class="font-mono text-caption text-grey text-truncate" style="font-size: 0.68rem !important;">
              {{ genre.sound }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import type { GenreItem } from '@/composables/home/useHomeDiscovery'

defineProps<{
  genreItems: GenreItem[]
}>()

defineEmits<{
  (e: 'select-genre', name: string): void
}>()
</script>

<style scoped lang="scss">
.font-display {
  font-family: 'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.font-body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
}

.font-mono {
  font-family: 'Space Grotesk', monospace, sans-serif !important;
}

.z-1 {
  z-index: 1;
}

.cursor-pointer {
  cursor: pointer;
}

.genre-cyber-card {
  --genre-card-bg: rgb(var(--v-theme-surface));
  --genre-card-border: rgba(var(--v-border-color), var(--v-border-opacity));
  --genre-card-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 16px color-mix(in srgb, var(--genre-color) 15%, transparent);
  --genre-card-hover-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 28px color-mix(in srgb, var(--genre-color) 48%, transparent);
  --genre-bloom-opacity: 0.35;
  --genre-bloom-hover-opacity: 0.9;

  .v-theme--light & {
    --genre-card-bg: #FFFFFF;
    --genre-card-border: #E2E8F0;
    --genre-card-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 6px 16px -2px rgba(15, 23, 42, 0.04);
    --genre-card-hover-shadow: 0 14px 30px -4px rgba(15, 23, 42, 0.08), 0 0 24px color-mix(in srgb, var(--genre-color) 38%, transparent);
    --genre-bloom-opacity: 0.55;
    --genre-bloom-hover-opacity: 0.95;
  }

  min-height: 155px;
  background-color: var(--genre-card-bg) !important;
  border: 1px solid var(--genre-card-border) !important;
  border-top: 2.5px solid var(--genre-color) !important;
  box-shadow: var(--genre-card-shadow) !important;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.28s ease,
              box-shadow 0.28s ease;

  .genre-card-bloom {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 140px;
    height: 140px;
    filter: blur(28px);
    opacity: var(--genre-bloom-opacity);
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .genre-arrow {
    transition: transform 0.25s ease, color 0.25s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: var(--genre-color) !important;
    box-shadow: var(--genre-card-hover-shadow) !important;

    .genre-card-bloom {
      opacity: var(--genre-bloom-hover-opacity);
      transform: scale(1.3);
    }

    .genre-arrow {
      transform: translate(2px, -2px);
      color: var(--genre-color) !important;
    }
  }
}
</style>
