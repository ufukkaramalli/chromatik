<template>
  <v-card
    :id="`soundkit-card-${kit._id || kit.id}`"
    rounded="xl"
    border
    color="#121018"
    elevation="0"
    class="soundkit-card h-100 d-flex flex-column"
  >
    <v-img :src="thumbnail" :alt="kit.title" aspect-ratio="1" cover class="align-start">
      <div class="d-flex justify-space-between pa-3">
        <v-chip size="small" variant="flat" color="black" class="font-weight-bold" prepend-icon="mdi-folder-music-outline">
          {{ $t('Explore.Soundkits.Badge') }}
        </v-chip>
        <v-chip
          size="small"
          variant="flat"
          :color="isFree ? 'success' : 'primary'"
          class="font-weight-black"
        >
          {{ isFree ? $t('Explore.Soundkits.Free') : currencyStore.formatPrice(kit.price) }}
        </v-chip>
      </div>
    </v-img>

    <v-card-text class="pa-4 d-flex flex-column flex-grow-1">
      <div class="text-subtitle-1 font-weight-bold text-white text-truncate">{{ kit.title }}</div>
      <router-link
        v-if="kit.user?.slug"
        :to="{ name: 'Profile', params: { userSlug: kit.user.slug } }"
        class="text-caption text-grey-lighten-1 text-decoration-none text-truncate"
      >
        {{ kit.user.name }}
      </router-link>
      <p v-if="kit.description" class="text-caption text-grey mt-2 mb-0 soundkit-desc">
        {{ kit.description }}
      </p>
      <div class="d-flex align-center text-caption text-grey mt-auto pt-3">
        <v-icon size="14" class="mr-1">mdi-eye-outline</v-icon>
        {{ formatCompactNumber(kit.views) }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useCurrencyStore } from '@/stores/currencyStore'
import { resolveMediaUrl } from '@/utils/url'
import { formatCompactNumber } from '@/utils/format'

const props = defineProps({
  kit: { type: Object, required: true }
})

const currencyStore = useCurrencyStore()
const thumbnail = computed(() => resolveMediaUrl(props.kit.thumbnailUrl, props.kit.title))
const isFree = computed(() => !(Number(props.kit.price) > 0))
</script>

<style scoped>
.soundkit-card {
  transition: transform 0.25s ease, border-color 0.25s ease;
}
.soundkit-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.6) !important;
}
.soundkit-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
