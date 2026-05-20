"use client"

import { useEffect, useMemo, useState } from "react"
import { LineChart, TrendingDown, TrendingUp } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/mock-data"
import { getMarketTicker } from "@/services/market.service"
import type { MarketTickerItem } from "@/types"

export const TICKER_SYMBOLS = [
  "BTC",
  "ETH",
  "SOL",
  "AAPL",
  "NVDA",
  "TSLA",
  "SPY",
] as const

type MarketTickerProps = {
  items?: MarketTickerItem[]
}

function orderTickerItems(
  items: MarketTickerItem[],
  symbols: readonly string[]
): MarketTickerItem[] {
  const map = new Map(items.map((i) => [i.symbol.toUpperCase(), i]))
  return symbols
    .map((sym) => map.get(sym.toUpperCase()))
    .filter((x): x is MarketTickerItem => Boolean(x))
}

function TickerSkeleton() {
  return (
    <div className="flex gap-8 px-6 animate-pulse" aria-hidden>
      {TICKER_SYMBOLS.map((sym) => (
        <div key={sym} className="flex items-center gap-3">
          <div className="h-3 w-9 rounded bg-white/10" />
          <div className="h-3 w-14 rounded bg-white/5" />
          <div className="h-5 w-12 rounded bg-white/5" />
        </div>
      ))}
    </div>
  )
}

function TickerItem({ item }: { item: MarketTickerItem }) {
  const up = item.positive

  return (
    <div
      className="flex shrink-0 items-center gap-2.5 border-r border-white/[0.06] px-4 py-2 sm:gap-3 sm:px-5"
      role="listitem"
    >
      <span className="font-mono text-[11px] font-semibold tracking-wide text-white">
        {item.symbol}
      </span>
      <span className="hidden text-white/20 sm:inline" aria-hidden>
        ·
      </span>
      <span className="text-[11px] tabular-nums text-[#C4C4CC]">
        {formatCurrency(item.price)}
      </span>
      <span
        className={
          up
            ? "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-[#00D084] bg-[#00D084]/10"
            : "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-[#FF3B30] bg-[#FF3B30]/10"
        }
      >
        {up ? (
          <TrendingUp className="h-3 w-3 shrink-0" aria-hidden />
        ) : (
          <TrendingDown className="h-3 w-3 shrink-0" aria-hidden />
        )}
        {formatPercent(item.change24h)}
      </span>
    </div>
  )
}

export function MarketTicker({ items: controlledItems }: MarketTickerProps) {
  const [items, setItems] = useState<MarketTickerItem[]>(
    controlledItems?.length
      ? orderTickerItems(controlledItems, TICKER_SYMBOLS)
      : []
  )
  const [ready, setReady] = useState(Boolean(controlledItems?.length))

  useEffect(() => {
    if (controlledItems?.length) {
      setItems(orderTickerItems(controlledItems, TICKER_SYMBOLS))
      setReady(true)
      return
    }

    let cancelled = false
    getMarketTicker([...TICKER_SYMBOLS]).then((data) => {
      if (!cancelled) {
        setItems(orderTickerItems(data, TICKER_SYMBOLS))
        setReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [controlledItems])

  const loopItems = useMemo(() => {
    const ordered = orderTickerItems(items, TICKER_SYMBOLS)
    return ordered.length > 0 ? [...ordered, ...ordered] : []
  }, [items])

  return (
    <div
      className="aurex-ticker-bar relative z-40 w-full border-y border-white/[0.07] bg-[#060606]/98 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
      role="region"
      aria-label="Cotizaciones en vivo"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />

      <div className="mx-auto flex h-11 max-w-[100vw] items-stretch">
        <div className="hidden shrink-0 items-center gap-2 border-r border-white/[0.07] bg-[#080808] px-3 sm:flex md:px-4">
          <LineChart className="h-3.5 w-3.5 text-[#C9A227]" aria-hidden />
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
            Markets
          </span>
          <span className="relative flex h-1.5 w-1.5" title="En vivo">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D084] opacity-30" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D084]" />
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#060606] to-transparent sm:w-12"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#060606] to-transparent sm:w-12"
            aria-hidden
          />

          {!ready ? (
            <div className="flex h-full items-center">
              <TickerSkeleton />
            </div>
          ) : (
            <div
              className="flex h-full w-max flex-nowrap items-center aurex-ticker-track"
              role="list"
              aria-live="polite"
            >
              {loopItems.map((item, index) => (
                <TickerItem key={`${item.symbol}-${index}`} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
