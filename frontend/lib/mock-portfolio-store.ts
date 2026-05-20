import { getCachedMarketAsset } from '@/lib/live-market-cache'
import {
  loadExtraMockPortfolios,
  loadMockTransactions,
  saveExtraMockPortfolios,
  saveMockTransactions,
  type StoredMockPortfolio,
} from '@/lib/mock-storage'
import { mockAssets, mockPortfolio } from '@/lib/mock-data'
import type { Asset, Holding, Transaction } from '@/types'
import type { PortfolioSummary } from '@/types/api'

function persistTransactions() {
  const record: Record<string, Transaction[]> = {}
  for (const [id, list] of transactionsByPortfolio.entries()) {
    record[id] = list
  }
  saveMockTransactions(record)
}

function hydrateTransactions() {
  const record = loadMockTransactions()
  transactionsByPortfolio.clear()
  for (const [id, list] of Object.entries(record)) {
    transactionsByPortfolio.set(id, list)
  }
}

const transactionsByPortfolio = new Map<string, Transaction[]>()
let extraPortfolios: StoredMockPortfolio[] = loadExtraMockPortfolios()

hydrateTransactions()

export function registerMockPortfolio(id: string, name: string, createdAt: string) {
  extraPortfolios = [
    { id, name, createdAt },
    ...extraPortfolios.filter((p) => p.id !== id),
  ]
  saveExtraMockPortfolios(extraPortfolios)
}

export function listMockPortfolios(): { id: string; name: string; createdAt: string }[] {
  const userCreated = extraPortfolios.map((p) => ({ ...p }))
  if (userCreated.length > 0) return userCreated
  return [
    {
      id: mockPortfolio.id,
      name: mockPortfolio.name,
      createdAt: mockPortfolio.createdAt,
    },
  ]
}

export function addMockTransaction(tx: Transaction) {
  const list = transactionsByPortfolio.get(tx.portfolioId) ?? []
  transactionsByPortfolio.set(tx.portfolioId, [tx, ...list])
  persistTransactions()
}

export function getMockTransactions(portfolioId: string): Transaction[] {
  return [...(transactionsByPortfolio.get(portfolioId) ?? [])]
}

function resolveAsset(symbol: string): Asset {
  const cached = getCachedMarketAsset(symbol)
  if (cached) return cached
  const found = mockAssets.find((a) => a.symbol === symbol.toUpperCase())
  if (found) return found
  return {
    id: symbol.toLowerCase(),
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    type: 'CRYPTO',
    price: 0,
    change24h: 0,
    marketCap: 0,
    volume24h: 0,
  }
}

/** Holdings derivados solo de tus transacciones + precios de mercado actuales. */
export function getMockHoldingsFromTransactions(portfolioId: string): Holding[] {
  const txs = getMockTransactions(portfolioId)
  if (txs.length === 0) return []

  const lots = new Map<
    string,
    { quantity: number; costBasis: number; asset: Asset }
  >()

  const ordered = [...txs].sort(
    (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
  )

  for (const tx of ordered) {
    const symbol = tx.asset.symbol
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
      if (current.quantity > 0) {
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
    const currentPrice = market.price
    const currentValue = lot.quantity * currentPrice
    totalValue += currentValue
    const avgCost = lot.costBasis / lot.quantity
    const profitLoss = (currentPrice - avgCost) * lot.quantity
    holdings.push({
      id: `holding_${symbol}`,
      assetId: symbol,
      asset: market,
      quantity: lot.quantity,
      avgBuyPrice: avgCost,
      currentValue,
      profitLoss,
      profitLossPercent: avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0,
      allocation: 0,
    })
  }

  for (const h of holdings) {
    h.allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0
  }

  return holdings.sort((a, b) => b.currentValue - a.currentValue)
}

export function getMockSummaryFromHoldings(
  portfolioId: string,
  holdings: Holding[]
): PortfolioSummary {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0)
  const totalCost = holdings.reduce((s, h) => s + h.avgBuyPrice * h.quantity, 0)
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercent =
    totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  const sorted = [...holdings].sort(
    (a, b) => b.profitLossPercent - a.profitLossPercent
  )

  return {
    portfolioId,
    totalValue,
    totalProfitLoss,
    totalProfitLossPercent,
    dailyReturn: totalProfitLossPercent * 0.05,
    monthlyReturn: totalProfitLossPercent * 0.2,
    aiRiskScore: Math.min(95, Math.max(15, Math.round(40 + holdings.length * 8))),
    bestAsset: sorted[0]?.asset.symbol ?? '—',
    worstAsset: sorted[sorted.length - 1]?.asset.symbol ?? '—',
  }
}
