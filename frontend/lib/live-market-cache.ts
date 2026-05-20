import { getMarketAssets } from '@/services/market.service'
import type { MarketAsset } from '@/types'

const priceBySymbol = new Map<string, MarketAsset>()

export function getCachedMarketAsset(symbol: string): MarketAsset | undefined {
  return priceBySymbol.get(symbol.toUpperCase())
}

export function setCachedMarketAssets(assets: MarketAsset[]) {
  priceBySymbol.clear()
  for (const asset of assets) {
    priceBySymbol.set(asset.symbol.toUpperCase(), asset)
  }
}

export async function refreshLiveMarketCache(): Promise<MarketAsset[]> {
  const assets = await getMarketAssets()
  setCachedMarketAssets(assets)
  return assets
}
