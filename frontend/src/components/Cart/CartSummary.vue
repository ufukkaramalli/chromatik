<template>
  <div class="cart-summary pa-4 border-t border-white-10">
    <!-- Currency Notice -->
    <div class="text-tiny text-grey mb-3 d-flex align-center">
      <v-icon size="14" color="grey" class="mr-1">mdi-information-outline</v-icon>
      <span>{{ $t('Cart.CurrencyNotice', { source: currencyStore.sourceLabel }) }}</span>
    </div>

    <!-- Subtotal & Total Row -->
    <div class="d-flex align-center justify-space-between mb-2">
      <span class="text-body-2 text-grey">{{ $t('Cart.Subtotal') }}</span>
      <span class="text-subtitle-1 font-weight-bold text-white">
        {{ cartStore.formattedTotal }}
      </span>
    </div>

    <div v-if="currencyStore.activeCurrency === 'TRY'" class="d-flex align-center justify-space-between mb-3 text-caption text-grey">
      <span>{{ $t('Cart.UsdEquivalent') }}</span>
      <span>${{ cartStore.totalUsd }}</span>
    </div>

    <!-- Checkout Button -->
    <v-btn
      block
      color="primary"
      size="large"
      rounded="lg"
      class="font-weight-black elevation-8 mb-2"
      :disabled="cartStore.isEmpty"
      @click="handleCheckout"
    >
      <v-icon start size="18">mdi-lock-outline</v-icon>
      {{ $t('Cart.Checkout') }}
    </v-btn>

    <!-- Clear Cart Button -->
    <div v-if="!cartStore.isEmpty" class="text-center mt-2">
      <v-btn
        variant="text"
        size="x-small"
        color="grey"
        @click="cartStore.clearCart"
      >
        {{ $t('Cart.Clear') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cartStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const router = useRouter()

function handleCheckout() {
  cartStore.closeDrawer()
  // Navigate to checkout or open checkout flow
  // router.push({ name: 'Checkout' })
}
</script>

<style scoped>
.cart-summary {
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(12px);
}

.text-tiny {
  font-size: 0.72rem;
  line-height: 1.2;
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
