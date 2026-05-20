import { getCachedMarketAsset } from '@/lib/live-market-cache'
import { mockAssets } from '@/lib/mock-data'
import type { Asset, Holding, Transaction } from '@/types'

const MAX_SANE_QUANTITY = 1_000_000

export function assertSaneTransactionQuantity(
  quantity: number,
  symbol: string
): void {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive number.')
  }
  if (quantity > MAX_SANE_QUANTITY) {
    throw new Error(
      `Quantity for ${symbol} is too large. Check decimals (use 5 not 5000000).`
    )
  }
}

function resolveAsset(symbol: string): Asset {
  const upper = symbol.toUpperCase()
  const cached = getCachedMarketAsset(upper)
  if (cached) return cached
  const found = mockAssets.find((a) => a.symbol === upper)
  if (found) return found
  return {
    id: upper.toLowerCase(),
    symbol: upper,
    name: upper,
    type: 'CRYPTO',
    price: 0,
    change24h: 0,
    marketCap: 0,
    volume24h: 0,
  }
}

/** Posiciones calculadas desde BUY/SELL (misma lógica que el mock store). */
export function computeHoldingsFromTransactions(
  transactions: Transaction[]
): Holding[] {
  if (transactions.length === 0) return []

  const lots = new Map<
    string,
    { quantity: number; costBasis: number; asset: Asset }
  >()

  const ordered = [...transactions].sort(
    (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
  )

  for (const tx of ordered) {
    const symbol = tx.asset.symbol.toUpperCase()
    const asset = resolveAsset(symbol)
    const current = lots.get(symbol) ?? {
      quantity: 0,
      costBasis: 0,
      asset,
    }

    if (tx.type === 'BUY') {
      current.quantity += tx.quantity
      current.costBasis += tx.quantity * tx.price
    } else {
      const sellQty = Math.min(tx.quantity, current.quantity)
      if (current.quantity > 0 && sellQty > 0) {
        const avgCost = current.costBasis / current.quantity
        current.quantity -= sellQty
        current.costBasis -= avgCost * sellQty
      }
    }
    lots.set(symbol, current)
  }

  const holdings: Holding[] = []
  let totalValue = 0

  for (const [symbol, lot] of lots) {
    if (lot.quantity <= 1e-12) continue
    const market = resolveAsset(symbol)
    const avgCost = lot.costBasis / lot.quantity
    const live = market.price > 0 ? market.price : null
    const markPrice = live
    const currentValue =
      markPrice != null ? lot.quantity * markPrice : lot.quantity * avgCost
    totalValue += currentValue
    const profitLoss =
      markPrice != null ? (markPrice - avgCost) * lot.quantity : 0
    const profitLossPercent =
      markPrice != null && avgCost > 0
        ? ((markPrice - avgCost) / avgCost) * 100
        : 0
    holdings.push({
      id: `holding_${symbol}`,
      assetId: symbol,
      asset: { ...market, price: markPrice ?? 0 },
      quantity: lot.quantity,
      avgBuyPrice: avgCost,
      currentValue,
      profitLoss,
      profitLossPercent,
      allocation: 0,
      markPrice,
    })
  }

  for (const h of holdings) {
    h.allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0
  }

  return holdings.sort((a, b) => b.currentValue - a.currentValue)
}
