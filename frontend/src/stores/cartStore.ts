import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/axios'
// @ts-ignore
import { useAuthStore } from './auth'
import { useCurrencyStore } from './currencyStore'
import type { CartItem, CartItemType, TrackLicenseType, CartResponse } from '@/types/cart'
import type { TrackLike } from '@/types/audio'
import { getTrackId } from '@/utils/track'

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore()
  const currencyStore = useCurrencyStore()

  const items = ref<CartItem[]>([])
  const isDrawerOpen = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  // Load guest cart from localStorage
  function loadGuestCart(): CartItem[] {
    try {
      const raw = localStorage.getItem('chromatik_guest_cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveGuestCart(cartItems: CartItem[]) {
    try {
      localStorage.setItem('chromatik_guest_cart', JSON.stringify(cartItems))
    } catch {}
  }

  // --- Getters ---
  const itemCount = computed(() => {
    return items.value.filter(i => i.available !== false).length
  })

  const isEmpty = computed(() => itemCount.value === 0)

  const totalUsd = computed(() => {
    const sum = items.value
      .filter(i => i.available !== false)
      .reduce((acc, item) => acc + (item.priceUsd || 0), 0)
    return Math.round(sum * 100) / 100
  })

  const totalTry = computed(() => {
    const rate = currencyStore.rates.TRY || 45.0
    return Math.round(totalUsd.value * rate * 100) / 100
  })

  const formattedTotal = computed(() => {
    return currencyStore.formatPrice(totalUsd.value)
  })

  function hasItem(itemId: string, licenseType?: TrackLicenseType): boolean {
    return items.value.some(
      i => i.itemId === itemId && (!licenseType || i.licenseType === licenseType)
    )
  }

  // --- Actions ---

  /**
   * Initializes the cart: fetches from backend if authenticated, otherwise loads guest cart.
   */
  async function initCart(): Promise<void> {
    await currencyStore.fetchRates()

    if (authStore.authenticated) {
      const guestItems = loadGuestCart()
      if (guestItems.length > 0) {
        // Sync guest items to account
        await syncGuestCart(guestItems)
        localStorage.removeItem('chromatik_guest_cart')
      } else {
        await fetchServerCart()
      }
    } else {
      items.value = loadGuestCart()
    }
  }

  async function fetchServerCart(): Promise<void> {
    try {
      isLoading.value = true
      const res = await api.get('/cart')
      if (res.data?.success && res.data.data?.items) {
        items.value = res.data.data.items
      }
    } catch (err: any) {
      console.warn('[cartStore] Failed to fetch server cart', err)
    } finally {
      isLoading.value = false
    }
  }

  async function syncGuestCart(guestItems: CartItem[]): Promise<void> {
    try {
      isLoading.value = true
      const payload = guestItems.map(i => ({
        itemType: i.itemType,
        itemId: i.itemId,
        licenseType: i.licenseType
      }))
      const res = await api.post('/cart/sync', { items: payload })
      if (res.data?.success && res.data.data?.items) {
        items.value = res.data.data.items
      }
    } catch (err) {
      console.warn('[cartStore] Sync failed, fetching server cart', err)
      await fetchServerCart()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Adds a track with a specific license type to the cart.
   */
  async function addTrack(track: TrackLike, licenseType: TrackLicenseType = 'basic'): Promise<boolean> {
    const trackId = getTrackId(track) || track.id || ''
    if (!trackId) return false

    // Prevent adding own track if logged in
    const currentUserId = authStore.user?._id || authStore.user?.id
    const trackUserId = (track.user as any)?._id || (track.user as any)?.id || track.userId
    if (currentUserId && trackUserId && currentUserId === trackUserId) {
      errorMessage.value = 'CANNOT_PURCHASE_OWN_ITEM'
      return false
    }

    let priceUsd = 0
    switch (licenseType) {
      case 'basic':
        priceUsd = track.priceBasic ?? 0
        break
      case 'premium':
        priceUsd = track.pricePremium ?? 0
        break
      case 'unlimited':
        priceUsd = track.priceUnlimited ?? 0
        break
      case 'exclusive':
        priceUsd = track.priceExclusive ?? 0
        break
    }

    if (authStore.authenticated) {
      try {
        isLoading.value = true
        errorMessage.value = null
        const res = await api.post('/cart/items', {
          itemType: 'track',
          itemId: trackId,
          licenseType
        })
        if (res.data?.success && res.data.data?.items) {
          items.value = res.data.data.items
          isDrawerOpen.value = true
          return true
        }
      } catch (err: any) {
        errorMessage.value = err.response?.data?.message || 'ADD_TO_CART_FAILED'
        return false
      } finally {
        isLoading.value = false
      }
    } else {
      // Guest cart
      const existingIndex = items.value.findIndex(
        i => i.itemType === 'track' && i.itemId === trackId
      )

      const newItem: CartItem = {
        id: `track_${trackId}_${licenseType}`,
        itemType: 'track',
        itemId: trackId,
        name: track.name || '',
        art: track.art || '',
        artist: {
          id: trackUserId || '',
          name: track.user?.name || 'Artist',
          slug: track.user?.slug || ''
        },
        licenseType,
        priceUsd,
        available: true
      }

      if (existingIndex > -1) {
        items.value[existingIndex] = newItem
      } else {
        items.value.push(newItem)
      }

      saveGuestCart(items.value)
      isDrawerOpen.value = true
      return true
    }

    return false
  }

  /**
   * Adds a soundkit to the cart.
   */
  async function addSoundkit(kit: any): Promise<boolean> {
    const kitId = kit._id || kit.id
    if (!kitId) return false

    const currentUserId = authStore.user?._id || authStore.user?.id
    const kitUserId = (kit.user as any)?._id || (kit.user as any)?.id || kit.userId
    if (currentUserId && kitUserId && currentUserId === kitUserId) {
      errorMessage.value = 'CANNOT_PURCHASE_OWN_ITEM'
      return false
    }

    if (authStore.authenticated) {
      try {
        isLoading.value = true
        errorMessage.value = null
        const res = await api.post('/cart/items', {
          itemType: 'soundkit',
          itemId: kitId
        })
        if (res.data?.success && res.data.data?.items) {
          items.value = res.data.data.items
          isDrawerOpen.value = true
          return true
        }
      } catch (err: any) {
        errorMessage.value = err.response?.data?.message || 'ADD_TO_CART_FAILED'
        return false
      } finally {
        isLoading.value = false
      }
    } else {
      // Guest cart
      const existing = items.value.some(
        i => i.itemType === 'soundkit' && i.itemId === kitId
      )
      if (!existing) {
        const newItem: CartItem = {
          id: `soundkit_${kitId}`,
          itemType: 'soundkit',
          itemId: kitId,
          name: kit.title,
          art: kit.thumbnailUrl,
          artist: {
            id: kitUserId || '',
            name: kit.user?.name || 'Creator',
            slug: kit.user?.slug || ''
          },
          priceUsd: kit.price || 0,
          available: true
        }
        items.value.push(newItem)
        saveGuestCart(items.value)
      }
      isDrawerOpen.value = true
      return true
    }

    return false
  }

  /**
   * Updates license for a track already in cart.
   */
  async function updateLicense(cartItemId: string, newLicense: TrackLicenseType): Promise<void> {
    if (authStore.authenticated) {
      try {
        isLoading.value = true
        const res = await api.put(`/cart/items/${cartItemId}`, { licenseType: newLicense })
        if (res.data?.success && res.data.data?.items) {
          items.value = res.data.data.items
        }
      } catch (err) {
        console.error('[cartStore] updateLicense error', err)
      } finally {
        isLoading.value = false
      }
    } else {
      const item = items.value.find(i => i.id === cartItemId || i.itemId === cartItemId)
      if (item) {
        item.licenseType = newLicense
        saveGuestCart(items.value)
      }
    }
  }

  /**
   * Removes an item from the cart.
   */
  async function removeItem(cartItemId: string): Promise<void> {
    if (authStore.authenticated) {
      try {
        isLoading.value = true
        const res = await api.delete(`/cart/items/${cartItemId}`)
        if (res.data?.success && res.data.data?.items) {
          items.value = res.data.data.items
        }
      } catch (err) {
        console.error('[cartStore] removeItem error', err)
      } finally {
        isLoading.value = false
      }
    } else {
      items.value = items.value.filter(i => i.id !== cartItemId && i.itemId !== cartItemId)
      saveGuestCart(items.value)
    }
  }

  /**
   * Clears all items in the cart.
   */
  async function clearCart(): Promise<void> {
    if (authStore.authenticated) {
      try {
        isLoading.value = true
        await api.delete('/cart')
        items.value = []
      } catch (err) {
        console.error('[cartStore] clearCart error', err)
      } finally {
        isLoading.value = false
      }
    } else {
      items.value = []
      localStorage.removeItem('chromatik_guest_cart')
    }
  }

  function openDrawer() {
    isDrawerOpen.value = true
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  return {
    items,
    isDrawerOpen,
    isLoading,
    errorMessage,
    itemCount,
    isEmpty,
    totalUsd,
    totalTry,
    formattedTotal,
    hasItem,
    initCart,
    addTrack,
    addSoundkit,
    updateLicense,
    removeItem,
    clearCart,
    openDrawer,
    closeDrawer,
    toggleDrawer
  }
})
