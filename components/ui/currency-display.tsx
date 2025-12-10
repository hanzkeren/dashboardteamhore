'use client'

import React from 'react'
import { useCurrency } from '@/app/context/CurrencyContext'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number
  className?: string
  showLoading?: boolean
  compact?: boolean
}

export function CurrencyDisplay({
  amount,
  className,
  showLoading = false,
  compact = false
}: CurrencyDisplayProps) {
  const { formatCurrency, isLoading, currency } = useCurrency()
  const [formattedAmount, setFormattedAmount] = React.useState<string>('')

  React.useEffect(() => {
    const formatAsync = async () => {
      try {
        const formatted = await formatCurrency(amount)
        setFormattedAmount(formatted)
      } catch (error) {
        console.error('Error formatting currency:', error)
        // Fallback to base currency formatting
        setFormattedAmount(
          compact
            ? new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(amount)
            : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(amount)
        )
      }
    }

    formatAsync()
  }, [amount, formatCurrency, compact])

  if (showLoading && isLoading) {
    return (
      <span className={cn('animate-pulse', className)}>
        {compact ? '-' : '-'}
      </span>
    )
  }

  return (
    <span className={cn('font-mono', className)}>
      {formattedAmount}
    </span>
  )
}

export function CurrencyCompact({
  amount,
  className,
  showLoading = false
}: Omit<CurrencyDisplayProps, 'compact'>) {
  return (
    <CurrencyDisplay
      amount={amount}
      className={className}
      showLoading={showLoading}
      compact={true}
    />
  )
}