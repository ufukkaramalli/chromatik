<template>
  <div class="track-licenses-section">
    <h3 class="text-h5 font-weight-black text-high-emphasis mb-6 d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-tag-multiple</v-icon>
      {{ $t('Track.Licenses') }}
    </h3>
    
    <div class="d-flex flex-column gap-4">
      <!-- Basic Lease -->
      <v-card class="glass-card hover-card rounded-xl overflow-hidden border-left-primary" v-if="track.priceBasic !== null && track.priceBasic !== undefined">
        <v-card-text class="d-flex align-center justify-space-between pa-5">
          <div>
            <div class="text-subtitle-1 font-weight-black text-high-emphasis mb-1">{{ $t('Track.BasicLease') }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t('Track.BasicLeaseDesc') }}</div>
          </div>
          <v-btn
            color="primary"
            :variant="cartStore.hasItem(trackId, 'basic') ? 'tonal' : 'flat'"
            rounded="pill"
            class="font-weight-black px-6"
            @click="cartStore.addTrack(track, 'basic')"
          >
            <v-icon v-if="cartStore.hasItem(trackId, 'basic')" start size="16">mdi-check</v-icon>
            {{ currencyStore.formatPrice(track.priceBasic) }}
          </v-btn>
        </v-card-text>
      </v-card>
      
      <!-- Premium Lease -->
      <v-card class="glass-card hover-card rounded-xl overflow-hidden" v-if="track.pricePremium !== null && track.pricePremium !== undefined">
        <v-card-text class="d-flex align-center justify-space-between pa-5">
          <div>
            <div class="text-subtitle-1 font-weight-black text-high-emphasis mb-1">{{ $t('Track.PremiumLease') }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t('Track.PremiumLeaseDesc') }}</div>
          </div>
          <v-btn
            color="cyan"
            :variant="cartStore.hasItem(trackId, 'premium') ? 'tonal' : 'flat'"
            rounded="pill"
            class="font-weight-black px-6 text-black"
            @click="cartStore.addTrack(track, 'premium')"
          >
            <v-icon v-if="cartStore.hasItem(trackId, 'premium')" start size="16">mdi-check</v-icon>
            {{ currencyStore.formatPrice(track.pricePremium) }}
          </v-btn>
        </v-card-text>
      </v-card>
      
      <!-- Unlimited Lease -->
      <v-card class="glass-card hover-card rounded-xl overflow-hidden" v-if="track.priceUnlimited !== null && track.priceUnlimited !== undefined">
        <v-card-text class="d-flex align-center justify-space-between pa-5">
          <div>
            <div class="text-subtitle-1 font-weight-black text-high-emphasis mb-1">{{ $t('Track.UnlimitedLease') }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t('Track.UnlimitedLeaseDesc') }}</div>
          </div>
          <v-btn
            color="purple"
            :variant="cartStore.hasItem(trackId, 'unlimited') ? 'tonal' : 'flat'"
            rounded="pill"
            class="font-weight-black px-6"
            @click="cartStore.addTrack(track, 'unlimited')"
          >
            <v-icon v-if="cartStore.hasItem(trackId, 'unlimited')" start size="16">mdi-check</v-icon>
            {{ currencyStore.formatPrice(track.priceUnlimited) }}
          </v-btn>
        </v-card-text>
      </v-card>
      
      <!-- Exclusive -->
      <v-card class="glass-card hover-card rounded-xl overflow-hidden exclusive-card" v-if="track.priceExclusive !== null && track.priceExclusive !== undefined">
        <v-card-text class="d-flex align-center justify-space-between pa-5">
          <div>
            <div class="text-subtitle-1 font-weight-black text-warning mb-1"><v-icon size="small" class="mr-1">mdi-crown</v-icon>{{ $t('Track.Exclusive') }}</div>
            <div class="text-caption text-warning-lighten-1">{{ $t('Track.ExclusiveDesc') }}</div>
          </div>
          <v-btn
            color="warning"
            :variant="cartStore.hasItem(trackId, 'exclusive') ? 'tonal' : 'flat'"
            rounded="pill"
            class="font-weight-black px-6 text-black"
            @click="cartStore.addTrack(track, 'exclusive')"
          >
            <v-icon v-if="cartStore.hasItem(trackId, 'exclusive')" start size="16">mdi-check</v-icon>
            {{ currencyStore.formatPrice(track.priceExclusive) }}
          </v-btn>
        </v-card-text>
      </v-card>
      
      <div v-if="(track.priceBasic == null) && (track.pricePremium == null) && (track.priceUnlimited == null) && (track.priceExclusive == null)" class="text-center opacity-50 py-4">
        <v-icon size="32" class="mb-2">mdi-currency-usd-off</v-icon>
        <div class="text-caption">{{ $t('Track.NoPricing') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import type { Track } from '@/types/audio'

const props = defineProps<{
  track: Partial<Track>
}>()

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()

const trackId = computed(() => (props.track._id || props.track.id || '') as string)
</script>

<style scoped lang="scss">
.gap-4 { gap: 16px; }

.glass-card {
  background: rgba(20, 20, 25, 0.6) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;

  .v-theme--light & {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }
}

.hover-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 12px rgba(var(--v-theme-primary), 0.15) !important;
    border-color: rgba(var(--v-theme-primary), 0.4) !important;

    .v-theme--light & {
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08), 0 0 12px rgba(var(--v-theme-primary), 0.15) !important;
    }
  }
}

.border-left-primary {
  border-left: 4px solid rgb(var(--v-theme-primary)) !important;
}

.exclusive-card {
  background: rgba(255, 171, 0, 0.05) !important;
  border: 1px solid rgba(255, 171, 0, 0.2) !important;

  &:hover {
    border-color: rgba(255, 171, 0, 0.6) !important;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 171, 0, 0.15) !important;
  }
}
</style>
