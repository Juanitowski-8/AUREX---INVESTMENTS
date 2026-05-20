"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type DisplayCurrency = "USD" | "EUR" | "GBP" | "JPY"

const RATES: Record<DisplayCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150,
}

const SYMBOLS: Record<DisplayCurrency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
}

const STORAGE_KEY = "aurex_display_currency"

type CurrencyContextValue = {
  currency: DisplayCurrency
  setCurrency: (code: DisplayCurrency) => void
  formatMoney: (usdAmount: number, compact?: boolean) => string
  convertFromUsd: (usdAmount: number) => number
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("USD")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as DisplayCurrency | null
    if (stored && stored in RATES) setCurrencyState(stored)
  }, [])

  const setCurrency = useCallback((code: DisplayCurrency) => {
    setCurrencyState(code)
    localStorage.setItem(STORAGE_KEY, code)
    window.dispatchEvent(new Event("aurex-currency-change"))
  }, [])

  const convertFromUsd = useCallback(
    (usdAmount: number) => {
      if (!Number.isFinite(usdAmount)) return 0
      return usdAmount * (RATES[currency] ?? 1)
    },
    [currency]
  )

  const formatMoney = useCallback(
    (usdAmount: number, compact = false) => {
      if (!Number.isFinite(usdAmount)) return "—"
      const value = convertFromUsd(usdAmount)
      const symbol = SYMBOLS[currency]
      if (compact && Math.abs(value) >= 1e9) {
        return `${symbol}${(value / 1e9).toFixed(2)}B`
      }
      if (compact && Math.abs(value) >= 1e6) {
        return `${symbol}${(value / 1e6).toFixed(2)}M`
      }
      if (currency === "JPY") {
        return `${symbol}${Math.round(value).toLocaleString("en-US")}`
      }
      return `${symbol}${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    },
    [currency, convertFromUsd]
  )

  const value = useMemo(
    () => ({ currency, setCurrency, formatMoney, convertFromUsd }),
    [currency, setCurrency, formatMoney, convertFromUsd]
  )

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return ctx
}
