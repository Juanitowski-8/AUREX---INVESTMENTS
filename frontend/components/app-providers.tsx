"use client"

import { useEffect, type ReactNode } from "react"
import { CurrencyProvider } from "@/lib/currency"
import { evaluateMockAlerts } from "@/lib/mock-alert-engine"
import { refreshLiveMarketCache } from "@/lib/live-market-cache"
import { dispatchPortfolioUpdated } from "@/lib/portfolio-events"
import { IS_MOCK_MODE } from "@/lib/config"
import { getCachedPortfolioId } from "@/lib/api/portfolio-context"

const MARKET_POLL_MS = 45_000

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      try {
        await refreshLiveMarketCache()
        if (IS_MOCK_MODE) {
          await evaluateMockAlerts()
        }
        const portfolioId = getCachedPortfolioId()
        if (portfolioId && !cancelled) {
          dispatchPortfolioUpdated(portfolioId)
        }
      } catch {
        /* ignore network blips */
      }
    }

    void tick()
    const id = window.setInterval(() => void tick(), MARKET_POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return <CurrencyProvider>{children}</CurrencyProvider>
}
