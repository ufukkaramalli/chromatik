import { Schema, model } from 'mongoose'
import { ICart } from '../interfaces/cart.interface'

const CartItemSchema = new Schema(
  {
    itemType: {
      type: String,
      enum: ['track', 'soundkit'],
      required: true
    },
    trackId: {
      type: Schema.Types.ObjectId,
      ref: 'Track'
    },
    soundkitId: {
      type: Schema.Types.ObjectId,
      ref: 'Soundkit'
    },
    licenseType: {
      type: String,
      enum: ['basic', 'premium', 'unlimited', 'exclusive']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
)

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [CartItemSchema]
  },
  { timestamps: true }
)

export default model<ICart>('Cart', CartSchema)
