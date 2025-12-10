'use client'

import React, { useState } from 'react'
import { useCurrency } from '@/app/context/CurrencyContext'
import { CURRENCIES, Currency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DollarSign, Coins } from 'lucide-react'

export function CurrencySelector() {
  const { currency, setCurrency, isLoading } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
    setIsOpen(false)
  }

  const getCurrencyIcon = (code: Currency) => {
    return code === 'USD' ? (
      <DollarSign className="h-4 w-4" />
    ) : (
      <Coins className="h-4 w-4" />
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isLoading}
        >
          {getCurrencyIcon(currency)}
          <span className="hidden sm:inline">{currency}</span>
          <span className="sm:hidden">{CURRENCIES[currency].symbol}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.values(CURRENCIES).map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => handleCurrencyChange(curr.code)}
            className="gap-2 cursor-pointer"
          >
            {getCurrencyIcon(curr.code)}
            <div className="flex-1">
              <div className="font-medium">{curr.code}</div>
              <div className="text-sm text-muted-foreground">
                {curr.name}
              </div>
            </div>
            {currency === curr.code && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CurrencySelectorCompact() {
  const { currency, setCurrency, isLoading } = useCurrency()

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
  }

  return (
    <Select value={currency} onValueChange={handleCurrencyChange} disabled={isLoading}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(CURRENCIES).map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            {curr.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}