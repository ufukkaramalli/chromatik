<template>
  <div class="cart-item-row d-flex align-center justify-space-between pa-3 mb-2 rounded-lg">
    <!-- Cover & Details -->
    <div class="d-flex align-center flex-grow-1 overflow-hidden mr-2">
      <div class="item-art-wrapper mr-3 flex-shrink-0">
        <v-img
          v-if="item.art"
          :src="item.art"
          :alt="item.name"
          width="48"
          height="48"
          cover
          class="rounded-md"
        />
        <div v-else class="art-fallback rounded-md d-flex align-center justify-center">
          <v-icon size="20" color="grey-lighten-1">mdi-music-note</v-icon>
        </div>
      </div>

      <div class="item-meta overflow-hidden">
        <div class="text-subtitle-2 font-weight-bold text-truncate text-high-emphasis">
          {{ item.name }}
        </div>
        <div class="text-caption text-medium-emphasis text-truncate">
          {{ item.artist.name }}
        </div>

        <!-- License Badge or Selector (Tracks only) -->
        <div v-if="item.itemType === 'track'" class="d-flex align-center mt-1">
          <v-chip
            size="x-small"
            variant="tonal"
            color="primary"
            class="text-uppercase font-weight-black"
          >
            {{ formatLicenseName(item.licenseType) }}
          </v-chip>
        </div>
        <div v-else class="mt-1">
          <v-chip
            size="x-small"
            variant="tonal"
            color="info"
            class="text-uppercase font-weight-bold"
          >
            Soundkit
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Price & Actions -->
    <div class="d-flex align-center flex-shrink-0">
      <div class="text-right mr-3">
        <div class="font-weight-black text-high-emphasis text-subtitle-2">
          {{ currencyStore.formatPrice(item.priceUsd) }}
        </div>
        <div v-if="currencyStore.activeCurrency === 'TRY'" class="text-tiny text-medium-emphasis">
          ${{ item.priceUsd }}
        </div>
      </div>

      <v-btn
        icon="mdi-trash-can-outline"
        variant="text"
        size="x-small"
        color="medium-emphasis"
        class="hover-danger"
        :title="$t('Cart.Remove')"
        @click="cartStore.removeItem(item.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cartStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import type { CartItem, TrackLicenseType } from '@/types/cart'

const props = defineProps<{
  item: CartItem
}>()

const { t } = useI18n()
const cartStore = useCartStore()
const currencyStore = useCurrencyStore()

function formatLicenseName(type?: TrackLicenseType): string {
  if (!type) return 'License'
  switch (type) {
    case 'basic':
      return t('Cart.Licenses.Basic')
    case 'premium':
      return t('Cart.Licenses.Premium')
    case 'unlimited':
      return t('Cart.Licenses.Unlimited')
    case 'exclusive':
      return t('Cart.Licenses.Exclusive')
    default:
      return type
  }
}
</script>

<style scoped>
.cart-item-row {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08));
  transition: all 0.2s ease;
}

.cart-item-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-color: rgba(var(--v-border-color), 0.2);
}

.item-art-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.art-fallback {
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.text-tiny {
  font-size: 0.7rem;
  line-height: 1;
}

.hover-danger:hover {
  color: #ff5252 !important;
}
</style>
