import { Schema, model, Document } from 'mongoose'

export interface ICurrencyRate extends Document {
  base: string
  rates: {
    TRY: number
    EUR?: number
    [key: string]: number | undefined
  }
  source: string
  lastUpdated: Date
  createdAt?: Date
  updatedAt?: Date
}

const CurrencyRateSchema = new Schema<ICurrencyRate>(
  {
    base: { type: String, default: 'USD', required: true, unique: true },
    rates: {
      TRY: { type: Number, required: true },
      EUR: { type: Number }
    },
    source: { type: String, default: 'TCMB' },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default model<ICurrencyRate>('CurrencyRate', CurrencyRateSchema)
