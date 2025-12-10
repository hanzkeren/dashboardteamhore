import { CurrencyService, Currency } from './currency'

// Mock fetch for testing
global.fetch = jest.fn()

// Create a mock environment for testing
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('CurrencyService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    CurrencyService.clearCache()
  })

  describe('formatCurrency', () => {
    it('should format IDR correctly', () => {
      const result = CurrencyService.formatCurrency(1000000, 'IDR')
      expect(result).toBe('Rp1.000.000')
    })

    it('should format USD correctly', () => {
      const result = CurrencyService.formatCurrency(100.50, 'USD')
      expect(result).toBe('$100.50')
    })

    it('should handle zero values', () => {
      const result = CurrencyService.formatCurrency(0, 'IDR')
      expect(result).toBe('Rp0')
    })

    it('should handle decimal values in USD', () => {
      const result = CurrencyService.formatCurrency(1234.5678, 'USD')
      expect(result).toBe('$1,234.57')
    })
  })

  describe('formatCurrencyCompact', () => {
    it('should format IDR compactly', () => {
      const result = CurrencyService.formatCurrencyCompact(1000000, 'IDR')
      expect(result).toBe('Rp1.000.000')
    })

    it('should format USD compactly', () => {
      const result = CurrencyService.formatCurrencyCompact(1234.56, 'USD')
      expect(result).toBe('$1,234.56')
    })
  })

  describe('getExchangeRate', () => {
    it('should fetch exchange rate from API', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: 'success',
          conversion_rates: {
            USD: 0.000064
          }
        })
      })

      const rate = await CurrencyService.getExchangeRate('IDR', 'USD')
      expect(rate).toBe(0.000064)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('exchangerate-api.com')
      )
    })

    it('should use fallback rate on API failure', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const rate = await CurrencyService.getExchangeRate('IDR', 'USD')
      expect(rate).toBe(0.000064) // Fallback rate
    })

    it('should cache exchange rates', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: 'success',
          conversion_rates: {
            USD: 0.000064
          }
        })
      })

      // First call should hit the API
      await CurrencyService.getExchangeRate('IDR', 'USD')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await CurrencyService.getExchangeRate('IDR', 'USD')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should return 1 for same currency conversion', async () => {
      const rate = await CurrencyService.getExchangeRate('USD', 'USD')
      expect(rate).toBe(1)
    })
  })

  describe('convertCurrency', () => {
    it('should convert IDR to USD', async () => {
      // Mock exchange rate
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: 'success',
          conversion_rates: {
            USD: 0.000064
          }
        })
      })

      const converted = await CurrencyService.convertCurrency(15625, 'IDR', 'USD')
      expect(converted).toBe(1) // 15625 IDR = 1 USD
    })

    it('should convert USD to IDR', async () => {
      // Mock exchange rate
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: 'success',
          conversion_rates: {
            IDR: 15625
          }
        })
      })

      const converted = await CurrencyService.convertCurrency(100, 'USD', 'IDR')
      expect(converted).toBe(1562500) // 100 USD = 1,562,500 IDR
    })

    it('should return same amount for same currency', async () => {
      const converted = await CurrencyService.convertCurrency(100, 'USD', 'USD')
      expect(converted).toBe(100)
    })
  })

  describe('isValidCurrency', () => {
    it('should return true for valid currencies', () => {
      expect(CurrencyService.isValidCurrency('IDR')).toBe(true)
      expect(CurrencyService.isValidCurrency('USD')).toBe(true)
    })

    it('should return false for invalid currencies', () => {
      expect(CurrencyService.isValidCurrency('EUR')).toBe(false)
      expect(CurrencyService.isValidCurrency('invalid')).toBe(false)
    })
  })

  describe('getSupportedCurrencies', () => {
    it('should return all supported currencies', () => {
      const currencies = CurrencyService.getSupportedCurrencies()
      expect(currencies).toHaveLength(2)
      expect(currencies.map(c => c.code)).toContain('IDR')
      expect(currencies.map(c => c.code)).toContain('USD')
    })
  })
})