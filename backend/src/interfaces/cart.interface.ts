import { Document, Types } from 'mongoose'

export type CartItemType = 'track' | 'soundkit'
export type TrackLicenseType = 'basic' | 'premium' | 'unlimited' | 'exclusive'

export interface ICartItem {
  _id?: Types.ObjectId
  itemType: CartItemType
  trackId?: Types.ObjectId
  soundkitId?: Types.ObjectId
  licenseType?: TrackLicenseType
  addedAt?: Date
}

export interface ICart extends Document {
  userId: Types.ObjectId
  items: ICartItem[]
  createdAt: Date
  updatedAt: Date
}
