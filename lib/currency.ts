import { notFound } from 'next/navigation'

export type Currency = 'IDR' | 'USD'

export interface CurrencyConfig {
  code: Currency
  symbol: string
  locale: string
  name: string
}

export interface ExchangeRate {
  from: Currency
  to: Currency
  rate: number
  updatedAt: Date
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    locale: 'id-ID',
    name: 'Indonesian Rupiah'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar'
  }
}

export const DEFAULT_CURRENCY: Currency = 'IDR'

// Exchange rates cache (in production, this should be stored in Redis/Database)
let exchangeRatesCache: Map<string, ExchangeRate> = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export class CurrencyService {
  /**
   * Format currency amount based on currency code
   */
  static formatCurrency(amount: number, currency: Currency = DEFAULT_CURRENCY): string {
    const config = CURRENCIES[currency]

    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`)
    }

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(amount)
  }

  /**
   * Format currency amount with symbol without full Intl formatting
   * Useful for custom display formats
   */
  static formatCurrencyCompact(amount: number, currency: Currency = DEFAULT_CURRENCY): string {
    const config = CURRENCIES[currency]

    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`)
    }

    const formattedNumber = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(amount)

    return `${config.symbol}${formattedNumber}`
  }

  /**
   * Convert amount from one currency to another
   */
  static async convertCurrency(
    amount: number,
    from: Currency,
    to: Currency
  ): Promise<number> {
    if (from === to) return amount

    const rate = await this.getExchangeRate(from, to)
    return amount * rate
  }

  /**
   * Get exchange rate between two currencies
   */
  static async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    const cacheKey = `${from}-${to}`

    // Check cache first
    const cached = exchangeRatesCache.get(cacheKey)
    if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_DURATION) {
      return cached.rate
    }

    // Fetch fresh rate
    const rate = await this.fetchExchangeRate(from, to)

    // Update cache
    exchangeRatesCache.set(cacheKey, {
      from,
      to,
      rate,
      updatedAt: new Date()
    })

    return rate
  }

  /**
   * Fetch exchange rate from API
   */
  private static async fetchExchangeRate(from: Currency, to: Currency): Promise<number> {
    try {
      // Using exchangerate-api.com (free tier, 2000 requests/month)
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${from}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.result !== 'success') {
        throw new Error(`Exchange rate API error: ${data.error}`)
      }

      const rate = data.conversion_rates[to]

      if (!rate) {
        throw new Error(`Exchange rate not found for ${to}`)
      }

      return rate
    } catch (error) {
      console.error('Error fetching exchange rate:', error)

      // Fallback to static rates (should be updated regularly)
      const fallbackRates: Record<string, number> = {
        'IDR-USD': 0.000064, // 1 IDR = 0.000064 USD (as of Dec 2024)
        'USD-IDR': 15625     // 1 USD = 15625 IDR (as of Dec 2024)
      }

      const fallbackRate = fallbackRates[`${from}-${to}`]
      if (fallbackRate) {
        console.warn(`Using fallback exchange rate for ${from}-${to}: ${fallbackRate}`)
        return fallbackRate
      }

      throw error
    }
  }

  /**
   * Get all supported currencies
   */
  static getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(CURRENCIES)
  }

  /**
   * Validate currency code
   */
  static isValidCurrency(code: string): code is Currency {
    return Object.keys(CURRENCIES).includes(code)
  }

  /**
   * Preload exchange rates for all supported currency pairs
   */
  static async preloadExchangeRates(): Promise<void> {
    const currencies = Object.keys(CURRENCIES) as Currency[]

    for (const from of currencies) {
      for (const to of currencies) {
        if (from !== to) {
          try {
            await this.getExchangeRate(from, to)
          } catch (error) {
            console.error(`Failed to preload ${from}-${to}:`, error)
          }
        }
      }
    }
  }

  /**
   * Clear exchange rate cache
   */
  static clearCache(): void {
    exchangeRatesCache.clear()
  }
}