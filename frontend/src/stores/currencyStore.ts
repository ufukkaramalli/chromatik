import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/axios'

export interface ExchangeRates {
  TRY: number
  EUR?: number
  [key: string]: number | undefined
}

export const useCurrencyStore = defineStore('currency', () => {
  const baseCurrency = ref<'USD'>('USD')
  const activeCurrency = ref<'TRY' | 'USD'>('TRY')
  const rates = ref<ExchangeRates>({ TRY: 49.44 })
  const lastUpdated = ref<string | null>(null)
  const rateSource = ref<string>('GLOBAL')
  const isLoading = ref(false)

  // Initialize preferred currency based on saved or browser language
  const savedLang = localStorage.getItem('chromatik_locale') || localStorage.getItem('locale')
  if (savedLang === 'en') {
    activeCurrency.value = 'USD'
  } else {
    activeCurrency.value = 'TRY'
  }

  const currentRate = computed(() => {
    return rates.value[activeCurrency.value] || 1
  })

  const sourceLabel = computed(() => {
    const s = rateSource.value.toUpperCase()
    if (s.includes('TCMB')) return 'TCMB'
    if (s.includes('GLOBAL')) return 'Global FX'
    return 'Live FX'
  })

  async function fetchRates(): Promise<void> {
    try {
      isLoading.value = true
      const res = await api.get('/currency/rates')
      if (res.data?.success && res.data.data?.rates) {
        rates.value = res.data.data.rates
        lastUpdated.value = res.data.data.lastUpdated
        rateSource.value = res.data.data.source || 'GLOBAL'
      }
    } catch (err) {
      console.warn('[currencyStore] Failed to fetch live currency rates, using fallback', err)
    } finally {
      isLoading.value = false
    }
  }

  function setCurrency(curr: 'TRY' | 'USD') {
    activeCurrency.value = curr
  }

  /**
   * Formats a USD amount into either TRY or USD according to active currency or override.
   */
  function formatPrice(usdAmount: number, forceCurrency?: 'TRY' | 'USD'): string {
    const curr = forceCurrency || activeCurrency.value
    if (isNaN(usdAmount)) return '-'

    if (curr === 'TRY') {
      const tryRate = rates.value.TRY || 45.0
      const tryValue = usdAmount * tryRate
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(tryValue)
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(usdAmount)
  }

  /**
   * Dual formatting showing both local currency and base USD, e.g. "₺1.434,00 ($29.00)"
   */
  function formatDualPrice(usdAmount: number): string {
    if (activeCurrency.value === 'TRY') {
      return `${formatPrice(usdAmount, 'TRY')} (${formatPrice(usdAmount, 'USD')})`
    }
    return formatPrice(usdAmount, 'USD')
  }

  return {
    baseCurrency,
    activeCurrency,
    rates,
    lastUpdated,
    rateSource,
    sourceLabel,
    isLoading,
    currentRate,
    fetchRates,
    setCurrency,
    formatPrice,
    formatDualPrice
  }
})
