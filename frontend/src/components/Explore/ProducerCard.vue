<template>
  <v-card
    :id="`producer-card-${producer.slug}`"
    :to="{ name: 'Profile', params: { userSlug: producer.slug } }"
    rounded="xl"
    border
    color="surface"
    elevation="0"
    hover
    class="producer-card pa-5 h-100 d-flex flex-column align-center text-center"
    :style="{ '--pc-accent': palette.accent }"
  >
    <v-avatar size="96" class="producer-avatar mb-4">
      <v-img :src="avatarUrl" :alt="producer.name" cover />
    </v-avatar>

    <div class="text-subtitle-1 font-weight-bold text-high-emphasis text-truncate w-100">
      {{ producer.name }}
    </div>
    <div class="text-caption text-medium-emphasis d-flex align-center justify-center mb-4" style="min-height: 20px;">
      <template v-if="producer.location">
        <v-icon size="14" class="mr-1">mdi-map-marker-outline</v-icon>
        <span class="text-truncate">{{ producer.location }}</span>
      </template>
    </div>

    <div class="d-flex flex-wrap justify-center ga-2 mt-auto">
      <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-music-note-outline">
        {{ $t('Explore.Producers.Tracks', { count: producer.trackCount }) }}
        <GlassTooltip icon="mdi-music-note-outline" :text="$t('Explore.Producers.TracksHint')" />
      </v-chip>
      <v-chip size="small" variant="tonal" prepend-icon="mdi-play-outline">
        {{ formatCompactNumber(producer.totalPlays) }}
        <GlassTooltip icon="mdi-play-outline" :text="$t('Explore.Producers.PlaysHint')" />
      </v-chip>
      <v-chip size="small" variant="tonal" prepend-icon="mdi-heart-outline">
        {{ formatCompactNumber(producer.totalLikes) }}
        <GlassTooltip icon="mdi-heart-outline" :text="$t('Explore.Producers.LikesHint')" />
      </v-chip>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { resolveMediaUrl } from '@/utils/url'
import { formatCompactNumber } from '@/utils/format'
import { getThemePalette } from '@/utils/themePalette'

const props = defineProps({
  producer: { type: Object, required: true }
})

const avatarUrl = computed(() => resolveMediaUrl(props.producer.photoUrl, props.producer.slug || props.producer.name))
const palette = computed(() => getThemePalette(props.producer.profileTheme))
</script>

<style scoped>
.producer-card {
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.producer-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--pc-accent), 0.6) !important;
  box-shadow: 0 12px 36px -12px rgba(var(--pc-accent), 0.45);
}
.producer-avatar {
  box-shadow: 0 0 0 2px rgba(var(--pc-accent), 0.7), 0 0 24px rgba(var(--pc-accent), 0.35);
}
</style>
