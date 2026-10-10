<template>
  <v-navigation-drawer
    v-model="cartStore.isDrawerOpen"
    location="right"
    temporary
    width="400"
    class="cart-drawer-panel"
    elevation="24"
  >
    <div class="d-flex flex-column h-100">
      <!-- Header -->
      <div class="drawer-header pa-4 d-flex align-center justify-space-between border-b border-white-10">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-cart-outline</v-icon>
          <span class="text-h6 font-weight-bold text-white">{{ $t('Cart.Title') }}</span>
          <v-chip
            v-if="!cartStore.isEmpty"
            size="small"
            color="primary"
            variant="tonal"
            class="ml-2 font-weight-black"
          >
            {{ cartStore.itemCount }}
          </v-chip>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey"
          @click="cartStore.closeDrawer"
        />
      </div>

      <!-- Content -->
      <div class="drawer-body flex-grow-1 overflow-y-auto pa-4">
        <!-- Error Alert if any -->
        <v-alert
          v-if="cartStore.errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="mb-3"
          @click:close="cartStore.errorMessage = null"
        >
          {{ getLocalizedError(cartStore.errorMessage) }}
        </v-alert>

        <!-- Empty State -->
        <div v-if="cartStore.isEmpty" class="empty-cart-state text-center py-12 px-4">
          <div class="empty-icon-circle mx-auto mb-4 d-flex align-center justify-center">
            <v-icon size="40" color="primary">mdi-cart-off</v-icon>
          </div>
          <div class="text-h6 font-weight-bold text-white mb-2">
            {{ $t('Cart.Empty') }}
          </div>
          <div class="text-caption text-grey mb-6">
            {{ $t('Cart.EmptySubtitle') }}
          </div>
          <v-btn
            color="primary"
            variant="outlined"
            rounded="pill"
            class="font-weight-bold px-6"
            to="/"
            @click="cartStore.closeDrawer"
          >
            {{ $t('Cart.ExploreMusic') }}
          </v-btn>
        </div>

        <!-- Items List -->
        <div v-else class="items-list">
          <CartItemRow
            v-for="item in cartStore.items"
            :key="item.id || item.itemId"
            :item="item"
          />
        </div>
      </div>

      <!-- Footer / Summary -->
      <CartSummary v-if="!cartStore.isEmpty" />
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cartStore'
import { useI18n } from 'vue-i18n'
import CartItemRow from './CartItemRow.vue'
import CartSummary from './CartSummary.vue'

const cartStore = useCartStore()
const { t } = useI18n()

function getLocalizedError(errCode: string): string {
  const key = `Cart.Errors.${errCode}`
  return t(key) || errCode
}
</script>

<style scoped>
.cart-drawer-panel {
  background: rgba(18, 18, 18, 0.96) !important;
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.empty-icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}
</style>
