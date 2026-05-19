import { apiGet } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { mockDelay } from '@/lib/api/delay'
import type {
  BackendMarketAsset,
  BackendMarketHistoryPoint,
  BackendMarketTicker,
} from '@/lib/api/backend-types'
import {
  mapAssetFromSymbol,
  mapMarketAsset,
  mapMarketTickerItem,
  mapPriceHistory,
} from '@/lib/api/mappers'
import { withDataSource } from '@/lib/api/with-data-source'
import { getMockMarketHistory, mockAssets } from '@/lib/mock-data'
import type { Asset, MarketAsset, MarketTickerItem, PriceHistoryPoint } from '@/types'

const DEFAULT_TICKER_SYMBOLS = [
  'BTC',
  'ETH',
  'SOL',
  'AAPL',
  'NVDA',
  'TSLA',
  'SPY',
] as const

/** GET /api/market/ticker?symbols=... */
export async function getMarketTicker(
  symbols: string[] = [...DEFAULT_TICKER_SYMBOLS]
): Promise<MarketTickerItem[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return symbols
        .map((sym) => mockAssets.find((a) => a.symbol === sym.toUpperCase()))
        .filter((a): a is MarketAsset => Boolean(a))
        .map((a) => ({
          symbol: a.symbol,
          price: a.price,
          change24h: a.change24h,
          positive: a.change24h >= 0,
        }))
    },
    async () => {
      const raw = await apiGet<BackendMarketTicker[]>(API_ENDPOINTS.market.ticker, {
        params: { symbols: symbols.join(',') },
      })
      return raw.map(mapMarketTickerItem)
    }
  )
}

/** GET /api/market/assets */
export async function getMarketAssets(): Promise<MarketAsset[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return [...mockAssets]
    },
    async () => {
      const raw = await apiGet<BackendMarketAsset[]>(API_ENDPOINTS.market.assets)
      return raw.map(mapMarketAsset)
    }
  )
}

/** GET /api/market/assets/{symbol} */
export async function getMarketAssetBySymbol(symbol: string): Promise<Asset | null> {
  return withDataSource(
    async () => {
      await mockDelay()
      return mockAssets.find((a) => a.symbol === symbol.toUpperCase()) ?? null
    },
    async () => {
      try {
        const raw = await apiGet<BackendMarketAsset>(
          API_ENDPOINTS.market.asset(symbol)
        )
        return mapMarketAsset(raw)
      } catch {
        return null
      }
    },
    { fallbackToMockOnError: false }
  )
}

/** GET /api/market/history/{symbol} */
export async function getMarketHistory(symbol: string): Promise<PriceHistoryPoint[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return getMockMarketHistory(symbol)
    },
    async () => {
      const raw = await apiGet<BackendMarketHistoryPoint[]>(
        API_ENDPOINTS.market.history(symbol)
      )
      return mapPriceHistory(raw)
    }
  )
}
