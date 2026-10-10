import CartModel from '../model/cart.model'
import TrackModel from '../model/track.model'
import SoundkitModel from '../model/soundkit.model'
import currencyService from './currency.service'
import HttpException from '../utils/exceptions/http.exception'
import { CartItemType, TrackLicenseType } from '../interfaces/cart.interface'
import { Types } from 'mongoose'

export interface PopulatedCartItem {
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
  priceTry: number
  available: boolean
  unavailableReason?: string
}

export interface PopulatedCartResponse {
  items: PopulatedCartItem[]
  totalUsd: number
  totalTry: number
  exchangeRate: number
  itemCount: number
}

class CartService {
  /**
   * Retrieves the user's cart with live verified prices and TCMB exchange rates.
   */
  public async getCart(userId: string): Promise<PopulatedCartResponse> {
    let cart = await CartModel.findOne({ userId })
      .populate({
        path: 'items.trackId',
        select: 'name art user priceBasic pricePremium priceUnlimited priceExclusive status',
        populate: { path: 'userId', select: 'name slug _id' }
      })
      .populate({
        path: 'items.soundkitId',
        select: 'title thumbnailUrl user price status',
        populate: { path: 'userId', select: 'name slug _id' }
      })
      .exec()

    if (!cart) {
      cart = await CartModel.create({ userId, items: [] })
    }

    const { rates } = await currencyService.getRates()
    const rate = rates.TRY || 45.0

    const populatedItems: PopulatedCartItem[] = []
    let totalUsd = 0

    for (const item of cart.items) {
      if (item.itemType === 'track') {
        const track = item.trackId as any
        if (!track || track.status !== 'public') {
          populatedItems.push({
            id: item._id ? item._id.toString() : '',
            itemType: 'track',
            itemId: track?._id?.toString() || '',
            name: track?.name || 'Unavailable Track',
            art: track?.art || '',
            artist: {
              id: track?.userId?._id?.toString() || '',
              name: track?.userId?.name || '',
              slug: track?.userId?.slug || ''
            },
            licenseType: item.licenseType,
            priceUsd: 0,
            priceTry: 0,
            available: false,
            unavailableReason: 'ITEM_UNAVAILABLE'
          })
          continue
        }

        // Determine price by license
        let price = 0
        switch (item.licenseType) {
          case 'basic':
            price = track.priceBasic ?? 0
            break
          case 'premium':
            price = track.pricePremium ?? 0
            break
          case 'unlimited':
            price = track.priceUnlimited ?? 0
            break
          case 'exclusive':
            price = track.priceExclusive ?? 0
            break
          default:
            price = track.priceBasic ?? 0
        }

        const priceTry = Math.round(price * rate * 100) / 100
        totalUsd += price

        populatedItems.push({
          id: item._id ? item._id.toString() : '',
          itemType: 'track',
          itemId: track._id.toString(),
          name: track.name,
          art: track.art,
          artist: {
            id: track.userId?._id?.toString() || '',
            name: track.userId?.name || 'Artist',
            slug: track.userId?.slug || ''
          },
          licenseType: item.licenseType || 'basic',
          priceUsd: price,
          priceTry,
          available: true
        })
      } else if (item.itemType === 'soundkit') {
        const kit = item.soundkitId as any
        if (!kit || kit.status !== 'public') {
          populatedItems.push({
            id: item._id ? item._id.toString() : '',
            itemType: 'soundkit',
            itemId: kit?._id?.toString() || '',
            name: kit?.title || 'Unavailable Soundkit',
            art: kit?.thumbnailUrl || '',
            artist: {
              id: kit?.userId?._id?.toString() || '',
              name: kit?.userId?.name || '',
              slug: kit?.userId?.slug || ''
            },
            priceUsd: 0,
            priceTry: 0,
            available: false,
            unavailableReason: 'ITEM_UNAVAILABLE'
          })
          continue
        }

        const price = kit.price ?? 0
        const priceTry = Math.round(price * rate * 100) / 100
        totalUsd += price

        populatedItems.push({
          id: item._id ? item._id.toString() : '',
          itemType: 'soundkit',
          itemId: kit._id.toString(),
          name: kit.title,
          art: kit.thumbnailUrl,
          artist: {
            id: kit.userId?._id?.toString() || '',
            name: kit.userId?.name || 'Creator',
            slug: kit.userId?.slug || ''
          },
          priceUsd: price,
          priceTry,
          available: true
        })
      }
    }

    const totalTry = Math.round(totalUsd * rate * 100) / 100

    return {
      items: populatedItems,
      totalUsd: Math.round(totalUsd * 100) / 100,
      totalTry,
      exchangeRate: rate,
      itemCount: populatedItems.filter(i => i.available).length
    }
  }

  /**
   * Adds an item to the user's cart with validation.
   */
  public async addItem(
    userId: string,
    params: {
      itemType: CartItemType
      itemId: string
      licenseType?: TrackLicenseType
    }
  ): Promise<PopulatedCartResponse> {
    const { itemType, itemId, licenseType } = params

    if (!Types.ObjectId.isValid(itemId)) {
      throw new HttpException(400, 'Invalid item ID')
    }

    let cart = await CartModel.findOne({ userId })
    if (!cart) {
      cart = await CartModel.create({ userId, items: [] })
    }

    if (itemType === 'track') {
      const track = await TrackModel.findById(itemId).select('userId status priceBasic pricePremium priceUnlimited priceExclusive').exec()
      if (!track || track.status !== 'public') {
        throw new HttpException(404, 'ITEM_NOT_FOUND_OR_PRIVATE')
      }

      // Self-purchase prevention
      if (track.userId.toString() === userId) {
        throw new HttpException(400, 'CANNOT_PURCHASE_OWN_ITEM')
      }

      const lic = licenseType || 'basic'
      // Check if price exists for chosen license
      const hasPrice =
        (lic === 'basic' && track.priceBasic !== undefined && track.priceBasic !== null) ||
        (lic === 'premium' && track.pricePremium !== undefined && track.pricePremium !== null) ||
        (lic === 'unlimited' && track.priceUnlimited !== undefined && track.priceUnlimited !== null) ||
        (lic === 'exclusive' && track.priceExclusive !== undefined && track.priceExclusive !== null)

      if (!hasPrice) {
        throw new HttpException(400, 'LICENSE_NOT_FOR_SALE')
      }

      // Check if already in cart
      const existingIndex = cart.items.findIndex(
        i => i.itemType === 'track' && i.trackId?.toString() === itemId
      )

      if (existingIndex > -1) {
        // Update license type if already in cart
        cart.items[existingIndex].licenseType = lic
      } else {
        cart.items.push({
          itemType: 'track',
          trackId: new Types.ObjectId(itemId),
          licenseType: lic,
          addedAt: new Date()
        } as any)
      }
    } else if (itemType === 'soundkit') {
      const kit = await SoundkitModel.findById(itemId).select('userId status price').exec()
      if (!kit || kit.status !== 'public') {
        throw new HttpException(404, 'ITEM_NOT_FOUND_OR_PRIVATE')
      }

      if (kit.userId.toString() === userId) {
        throw new HttpException(400, 'CANNOT_PURCHASE_OWN_ITEM')
      }

      const existingIndex = cart.items.findIndex(
        i => i.itemType === 'soundkit' && i.soundkitId?.toString() === itemId
      )

      if (existingIndex === -1) {
        cart.items.push({
          itemType: 'soundkit',
          soundkitId: new Types.ObjectId(itemId),
          addedAt: new Date()
        } as any)
      }
    }

    await cart.save()
    return this.getCart(userId)
  }

  /**
   * Updates license type of an existing track in cart.
   */
  public async updateLicense(
    userId: string,
    itemId: string,
    newLicense: TrackLicenseType
  ): Promise<PopulatedCartResponse> {
    const cart = await CartModel.findOne({ userId })
    if (!cart) throw new HttpException(404, 'Cart not found')

    const item = cart.items.find(
      i =>
        i.itemType === 'track' &&
        (i._id?.toString() === itemId || i.trackId?.toString() === itemId)
    )

    if (!item) throw new HttpException(404, 'Item not found in cart')

    item.licenseType = newLicense
    await cart.save()
    return this.getCart(userId)
  }

  /**
   * Removes an item from the cart.
   */
  public async removeItem(userId: string, itemId: string): Promise<PopulatedCartResponse> {
    const cart = await CartModel.findOne({ userId })
    if (!cart) throw new HttpException(404, 'Cart not found')

    cart.items = cart.items.filter(
      i =>
        i._id?.toString() !== itemId &&
        i.trackId?.toString() !== itemId &&
        i.soundkitId?.toString() !== itemId
    ) as any

    await cart.save()
    return this.getCart(userId)
  }

  /**
   * Clears the entire cart.
   */
  public async clearCart(userId: string): Promise<PopulatedCartResponse> {
    await CartModel.findOneAndUpdate({ userId }, { items: [] }, { upsert: true })
    return this.getCart(userId)
  }

  /**
   * Synchronizes guest items from localStorage into authenticated user cart.
   */
  public async syncGuestCart(
    userId: string,
    guestItems: Array<{
      itemType: CartItemType
      itemId: string
      licenseType?: TrackLicenseType
    }>
  ): Promise<PopulatedCartResponse> {
    for (const gItem of guestItems) {
      try {
        await this.addItem(userId, gItem)
      } catch {
        // Skip invalid/unpurchasable items during bulk sync
      }
    }
    return this.getCart(userId)
  }
}

export default new CartService()
