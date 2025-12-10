'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Currency, CurrencyService, DEFAULT_CURRENCY } from '@/lib/currency'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  isLoading: boolean
  convertAmount: (amount: number, from?: Currency) => Promise<number>
  formatCurrency: (amount: number, from?: Currency) => Promise<string>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

interface CurrencyProviderProps {
  children: React.ReactNode
  defaultCurrency?: Currency
}

export function CurrencyProvider({ children, defaultCurrency = DEFAULT_CURRENCY }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency)
  const [isLoading, setIsLoading] = useState(false)

  // Load saved currency from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('selectedCurrency') as Currency
      if (savedCurrency && CurrencyService.isValidCurrency(savedCurrency)) {
        setCurrencyState(savedCurrency)
      }
    }
  }, [])

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', newCurrency)
    }
  }

  // Convert amount from base currency (IDR) to selected currency
  const convertAmount = async (amount: number, from: Currency = DEFAULT_CURRENCY): Promise<number> => {
    if (from === currency) return amount

    try {
      setIsLoading(true)
      const convertedAmount = await CurrencyService.convertCurrency(amount, from, currency)
      return convertedAmount
    } catch (error) {
      console.error('Currency conversion error:', error)
      // Return original amount if conversion fails
      return amount
    } finally {
      setIsLoading(false)
    }
  }

  // Format currency with conversion
  const formatCurrency = async (amount: number, from: Currency = DEFAULT_CURRENCY): Promise<string> => {
    try {
      let finalAmount = amount
      let finalCurrency = from

      // Convert if currencies are different
      if (from !== currency) {
        finalAmount = await convertAmount(amount, from)
        finalCurrency = currency
      }

      return CurrencyService.formatCurrency(finalAmount, finalCurrency)
    } catch (error) {
      console.error('Currency formatting error:', error)
      // Return formatted amount in base currency if conversion fails
      return CurrencyService.formatCurrency(amount, from)
    }
  }

  // Preload exchange rates on mount for better UX
  useEffect(() => {
    if (currency !== DEFAULT_CURRENCY) {
      CurrencyService.preloadExchangeRates().catch(console.error)
    }
  }, [currency])

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    isLoading,
    convertAmount,
    formatCurrency
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}