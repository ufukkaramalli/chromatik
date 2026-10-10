import CurrencyRateModel, { ICurrencyRate } from '../model/currency.model'
import logger from '../utils/logger'

export interface ExchangeRatesResult {
  base: string
  rates: {
    TRY: number
    EUR?: number
    [key: string]: number | undefined
  }
  source: string
  lastUpdated: Date
}

export class CurrencyService {
  private static instance: CurrencyService
  private cachedRates: ExchangeRatesResult | null = null
  private cacheExpiresAt: number = 0

  private get cacheTtlMs(): number {
    const mins = Number(process.env.CURRENCY_CACHE_TTL_MINUTES) || 60
    return mins * 60 * 1000
  }

  private get defaultTryRate(): number {
    return Number(process.env.CURRENCY_FALLBACK_TRY_RATE) || 45.0
  }

  private get provider(): 'global' | 'tcmb' {
    return (process.env.CURRENCY_PROVIDER as 'global' | 'tcmb') || 'global'
  }

  private get globalApiUrl(): string {
    return process.env.CURRENCY_API_URL || 'https://open.er-api.com/v6/latest/USD'
  }

  private get globalApiKey(): string {
    return process.env.CURRENCY_API_KEY || ''
  }

  private get tcmbUrl(): string {
    return process.env.TCMB_API_URL || 'https://www.tcmb.gov.tr/kurlar/today.xml'
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  /**
   * Returns current exchange rates from memory cache, primary provider, fallback provider, DB, or baseline.
   */
  public async getRates(): Promise<ExchangeRatesResult> {
    const now = Date.now()

    // 1. Check memory cache
    if (this.cachedRates && now < this.cacheExpiresAt) {
      return this.cachedRates
    }

    const preferredProvider = this.provider

    // 2. Try primary provider based on .env
    try {
      const primaryRates =
        preferredProvider === 'tcmb'
          ? await this.fetchFromTcmb()
          : await this.fetchFromGlobal()

      if (primaryRates) {
        this.cachedRates = primaryRates
        this.cacheExpiresAt = now + this.cacheTtlMs
        return primaryRates
      }
    } catch (primaryErr) {
      logger.warn(
        `[CurrencyService] Primary provider (${preferredProvider}) failed, attempting secondary provider fallback`,
        primaryErr
      )
    }

    // 3. Fallback to secondary provider
    try {
      const secondaryRates =
        preferredProvider === 'tcmb'
          ? await this.fetchFromGlobal()
          : await this.fetchFromTcmb()

      if (secondaryRates) {
        this.cachedRates = secondaryRates
        this.cacheExpiresAt = now + this.cacheTtlMs
        return secondaryRates
      }
    } catch (secondaryErr) {
      logger.warn(
        `[CurrencyService] Secondary provider failed, attempting database fallback`,
        secondaryErr
      )
    }

    // 4. Fallback to MongoDB latest stored rates
    try {
      const dbRate = await CurrencyRateModel.findOne({ base: 'USD' }).exec()
      if (dbRate && dbRate.rates?.TRY) {
        this.cachedRates = {
          base: 'USD',
          rates: {
            TRY: dbRate.rates.TRY,
            EUR: dbRate.rates.EUR
          },
          source: `${dbRate.source || 'DB'}_CACHED`,
          lastUpdated: dbRate.lastUpdated || dbRate.updatedAt || new Date()
        }
        this.cacheExpiresAt = now + 15 * 60 * 1000 // Retry in 15 mins
        return this.cachedRates
      }
    } catch (dbErr) {
      logger.error('[CurrencyService] Database fallback failed', dbErr)
    }

    // 5. Ultimate fallback (safe baseline)
    return {
      base: 'USD',
      rates: {
        TRY: this.defaultTryRate
      },
      source: 'FALLBACK',
      lastUpdated: new Date()
    }
  }

  /**
   * Fetches and parses exchange rates from configured Global JSON provider.
   */
  private async fetchFromGlobal(): Promise<ExchangeRatesResult | null> {
    const url = this.globalApiUrl
    const headers: Record<string, string> = {
      'User-Agent': 'Chromatik-Audio-Engine/1.0',
      Accept: 'application/json'
    }

    if (this.globalApiKey) {
      headers['Authorization'] = `Bearer ${this.globalApiKey}`
      headers['apikey'] = this.globalApiKey
    }

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`Global Currency API HTTP error: ${response.status}`)
    }

    const data: any = await response.json()
    const rawRates = data.rates || data.conversion_rates || (data.data && data.data.rates)

    if (!rawRates || typeof rawRates !== 'object') {
      throw new Error('Rates object missing in Global Currency API response')
    }

    const tryRate = parseFloat(rawRates.TRY)
    if (isNaN(tryRate) || tryRate <= 0) {
      throw new Error(`Invalid TRY rate received: ${rawRates.TRY}`)
    }

    let eurRate: number | undefined
    if (rawRates.EUR) {
      const parsedEur = parseFloat(rawRates.EUR)
      if (!isNaN(parsedEur) && parsedEur > 0) {
        eurRate = parsedEur
      }
    }

    const now = new Date()
    const result: ExchangeRatesResult = {
      base: data.base_code || data.base || 'USD',
      rates: {
        TRY: tryRate,
        EUR: eurRate
      },
      source: 'GLOBAL',
      lastUpdated: now
    }

    // Persist to database in background
    CurrencyRateModel.findOneAndUpdate(
      { base: 'USD' },
      {
        rates: result.rates,
        source: 'GLOBAL',
        lastUpdated: now
      },
      { upsert: true, new: true }
    ).catch(err => {
      logger.error('[CurrencyService] Failed to persist Global rates to MongoDB', err)
    })

    logger.info(`[CurrencyService] Updated rates from GLOBAL provider (${url}): 1 USD = ${tryRate} TRY`)
    return result
  }

  /**
   * Fetches and parses TCMB official today.xml feed
   */
  private async fetchFromTcmb(): Promise<ExchangeRatesResult | null> {
    const response = await fetch(this.tcmbUrl, {
      headers: {
        'User-Agent': 'Chromatik-Audio-Engine/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`TCMB HTTP error: ${response.status}`)
    }

    const xmlText = await response.text()

    // Extract USD ForexSelling (Banka/Döviz Satış kuru)
    const usdMatch = xmlText.match(
      /<Currency[^>]*CurrencyCode="USD"[^>]*>[\s\S]*?<ForexSelling>([0-9.]+)<\/ForexSelling>/
    )
    if (!usdMatch || !usdMatch[1]) {
      throw new Error('USD ForexSelling not found in TCMB XML')
    }

    const usdTrySelling = parseFloat(usdMatch[1])
    if (isNaN(usdTrySelling) || usdTrySelling <= 0) {
      throw new Error(`Invalid USD rate extracted: ${usdMatch[1]}`)
    }

    // Extract EUR ForexSelling (optional)
    let eurTrySelling: number | undefined
    const eurMatch = xmlText.match(
      /<Currency[^>]*CurrencyCode="EUR"[^>]*>[\s\S]*?<ForexSelling>([0-9.]+)<\/ForexSelling>/
    )
    if (eurMatch && eurMatch[1]) {
      const parsedEur = parseFloat(eurMatch[1])
      if (!isNaN(parsedEur) && parsedEur > 0) {
        eurTrySelling = parsedEur
      }
    }

    const now = new Date()
    const result: ExchangeRatesResult = {
      base: 'USD',
      rates: {
        TRY: usdTrySelling,
        EUR: eurTrySelling
      },
      source: 'TCMB',
      lastUpdated: now
    }

    // Persist to database in background
    CurrencyRateModel.findOneAndUpdate(
      { base: 'USD' },
      {
        rates: result.rates,
        source: 'TCMB',
        lastUpdated: now
      },
      { upsert: true, new: true }
    ).catch(err => {
      logger.error('[CurrencyService] Failed to persist TCMB rates to MongoDB', err)
    })

    logger.info(`[CurrencyService] Updated rates from TCMB (${this.tcmbUrl}): 1 USD = ${usdTrySelling} TRY`)
    return result
  }

  /**
   * Helper to convert USD amount to TRY using the active rate.
   */
  public async convertUsdToTry(usdAmount: number): Promise<{ tryAmount: number; rate: number }> {
    const { rates } = await this.getRates()
    const rate = rates.TRY || this.defaultTryRate
    const tryAmount = Math.round(usdAmount * rate * 100) / 100
    return { tryAmount, rate }
  }
}

export default CurrencyService.getInstance()
