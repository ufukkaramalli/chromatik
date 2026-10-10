export type CartItemType = 'track' | 'soundkit'
export type TrackLicenseType = 'basic' | 'premium' | 'unlimited' | 'exclusive'

export interface CartItem {
  id: string
  itemType: CartItemType
  itemId: string
  name: string
  art: string
  artist: {
    id: string
    name: string
    slug: string
  }
  licenseType?: TrackLicenseType
  priceUsd: number
  priceTry?: number
  available: boolean
  unavailableReason?: string
}

export interface CartResponse {
  items: CartItem[]
  totalUsd: number
  totalTry: number
  exchangeRate: number
  itemCount: number
}
