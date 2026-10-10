<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    scrollable
    class="license-modal-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card v-if="track" class="license-modal-card glass-premium pa-0 overflow-hidden rounded-xl">
      <!-- Header with Track Info -->
      <div class="modal-header pa-5 border-b border-white-10 d-flex align-center justify-space-between">
        <div class="d-flex align-center overflow-hidden mr-3">
          <v-img
            v-if="track.art"
            :src="track.art"
            width="56"
            height="56"
            cover
            class="rounded-lg mr-3 flex-shrink-0 shadow-premium"
          />
          <div class="overflow-hidden">
            <div class="text-caption text-primary font-weight-bold text-uppercase">
              {{ $t('Cart.Licenses.ChooseLicense') }}
            </div>
            <div class="text-h6 font-weight-black text-white text-truncate">
              {{ track.name }}
            </div>
            <div class="text-caption text-grey text-truncate">
              {{ track.user?.name }}
              <span v-if="track.bpm" class="ml-2">• {{ track.bpm }} BPM</span>
              <span v-if="track.key" class="ml-1">• {{ track.key }}</span>
            </div>
          </div>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey"
          @click="$emit('update:modelValue', false)"
        />
      </div>

      <!-- License Tiers List -->
      <v-card-text class="pa-5 overflow-y-auto">
        <div class="licenses-grid d-flex flex-column gap-3">
          <!-- 1. Basic Lease -->
          <div
            v-if="track.priceBasic !== undefined && track.priceBasic !== null"
            class="license-card pa-4 rounded-xl d-flex align-center justify-space-between"
            :class="{ 'is-in-cart': cartStore.hasItem(currentTrackId, 'basic') }"
          >
            <div class="mr-4">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-1 font-weight-black text-white mr-2">
                  {{ $t('Cart.Licenses.Basic') }}
                </span>
                <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                  MP3
                </v-chip>
              </div>
              <div class="text-caption text-grey">
                {{ $t('Cart.Licenses.BasicDesc') }}
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <div class="text-h6 font-weight-black text-white mb-2">
                {{ currencyStore.formatPrice(track.priceBasic) }}
              </div>
              <v-btn
                color="primary"
                rounded="pill"
                size="small"
                class="font-weight-bold px-4"
                :variant="cartStore.hasItem(currentTrackId, 'basic') ? 'tonal' : 'flat'"
                @click="selectLicense('basic')"
              >
                {{ cartStore.hasItem(currentTrackId, 'basic') ? $t('Cart.Licenses.InCart') : $t('Cart.Licenses.Select') }}
              </v-btn>
            </div>
          </div>

          <!-- 2. Premium Lease -->
          <div
            v-if="track.pricePremium !== undefined && track.pricePremium !== null"
            class="license-card pa-4 rounded-xl d-flex align-center justify-space-between"
            :class="{ 'is-in-cart': cartStore.hasItem(currentTrackId, 'premium') }"
          >
            <div class="mr-4">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-1 font-weight-black text-white mr-2">
                  {{ $t('Cart.Licenses.Premium') }}
                </span>
                <v-chip size="x-small" color="cyan" variant="tonal" class="font-weight-bold">
                  WAV + MP3
                </v-chip>
              </div>
              <div class="text-caption text-grey">
                {{ $t('Cart.Licenses.PremiumDesc') }}
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <div class="text-h6 font-weight-black text-white mb-2">
                {{ currencyStore.formatPrice(track.pricePremium) }}
              </div>
              <v-btn
                color="cyan"
                rounded="pill"
                size="small"
                class="font-weight-bold px-4 text-black"
                :variant="cartStore.hasItem(currentTrackId, 'premium') ? 'tonal' : 'flat'"
                @click="selectLicense('premium')"
              >
                {{ cartStore.hasItem(currentTrackId, 'premium') ? $t('Cart.Licenses.InCart') : $t('Cart.Licenses.Select') }}
              </v-btn>
            </div>
          </div>

          <!-- 3. Unlimited Lease -->
          <div
            v-if="track.priceUnlimited !== undefined && track.priceUnlimited !== null"
            class="license-card pa-4 rounded-xl d-flex align-center justify-space-between"
            :class="{ 'is-in-cart': cartStore.hasItem(currentTrackId, 'unlimited') }"
          >
            <div class="mr-4">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-1 font-weight-black text-white mr-2">
                  {{ $t('Cart.Licenses.Unlimited') }}
                </span>
                <v-chip size="x-small" color="purple" variant="tonal" class="font-weight-bold">
                  STEMS + WAV + MP3
                </v-chip>
              </div>
              <div class="text-caption text-grey">
                {{ $t('Cart.Licenses.UnlimitedDesc') }}
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <div class="text-h6 font-weight-black text-white mb-2">
                {{ currencyStore.formatPrice(track.priceUnlimited) }}
              </div>
              <v-btn
                color="purple"
                rounded="pill"
                size="small"
                class="font-weight-bold px-4"
                :variant="cartStore.hasItem(currentTrackId, 'unlimited') ? 'tonal' : 'flat'"
                @click="selectLicense('unlimited')"
              >
                {{ cartStore.hasItem(currentTrackId, 'unlimited') ? $t('Cart.Licenses.InCart') : $t('Cart.Licenses.Select') }}
              </v-btn>
            </div>
          </div>

          <!-- 4. Exclusive Rights -->
          <div
            v-if="track.priceExclusive !== undefined && track.priceExclusive !== null"
            class="license-card exclusive-tier pa-4 rounded-xl d-flex align-center justify-space-between"
            :class="{ 'is-in-cart': cartStore.hasItem(currentTrackId, 'exclusive') }"
          >
            <div class="mr-4">
              <div class="d-flex align-center mb-1">
                <v-icon color="warning" size="18" class="mr-1">mdi-crown</v-icon>
                <span class="text-subtitle-1 font-weight-black text-warning mr-2">
                  {{ $t('Cart.Licenses.Exclusive') }}
                </span>
                <v-chip size="x-small" color="warning" variant="flat" class="font-weight-black text-black">
                  OWNERSHIP
                </v-chip>
              </div>
              <div class="text-caption text-grey-lighten-1">
                {{ $t('Cart.Licenses.ExclusiveDesc') }}
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <div class="text-h6 font-weight-black text-warning mb-2">
                {{ currencyStore.formatPrice(track.priceExclusive) }}
              </div>
              <v-btn
                color="warning"
                rounded="pill"
                size="small"
                class="font-weight-black px-4 text-black"
                :variant="cartStore.hasItem(currentTrackId, 'exclusive') ? 'tonal' : 'flat'"
                @click="selectLicense('exclusive')"
              >
                {{ cartStore.hasItem(currentTrackId, 'exclusive') ? $t('Cart.Licenses.InCart') : $t('Cart.Licenses.Select') }}
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import type { TrackLike } from '@/types/audio'
import type { TrackLicenseType } from '@/types/cart'
import { getTrackId } from '@/utils/track'

const props = defineProps<{
  modelValue: boolean
  track: TrackLike | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()

const currentTrackId = computed(() => (props.track ? getTrackId(props.track) || '' : ''))

async function selectLicense(license: TrackLicenseType) {
  if (!props.track) return
  await cartStore.addTrack(props.track, license)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.license-modal-card {
  background: rgba(22, 22, 26, 0.96) !important;
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.license-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.license-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.exclusive-tier {
  background: linear-gradient(135deg, rgba(255, 179, 0, 0.08), rgba(255, 255, 255, 0.02));
  border-color: rgba(255, 179, 0, 0.25);
}

.exclusive-tier:hover {
  border-color: rgba(255, 179, 0, 0.45);
}

.is-in-cart {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.08);
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.gap-3 {
  gap: 12px;
}
</style>
