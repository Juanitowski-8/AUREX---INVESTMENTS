import { getAssetTypeColor } from '@/types/finance'
import type {
  AllocationItem,
  Holding,
  PortfolioPerformancePoint,
  Transaction,
} from '@/types'
import type { PortfolioSummary } from '@/types/api'

import {
  getAsset,
  mockAllocationData,
  mockHoldings,
  mockPortfolio,
  mockPortfolioHistory,
  mockTransactions,
} from '@/lib/mock-data'

function cloneHoldings(original: Holding[]): Holding[] {
  return original.map((h) => ({
    ...h,
    asset: { ...h.asset },
  }))
}

let liveHoldings: Holding[] | null = null
let liveTransactionsExtra: Transaction[] = []
let liveHistory: PortfolioPerformancePoint[] | null = null

function ensureHydrated(portfolioId: string): Holding[] | null {
  if (portfolioId !== mockPortfolio.id) return null
  if (typeof window === 'undefined') return null

  if (liveHoldings === null) {
    liveHoldings = cloneHoldings(mockHoldings)
    liveHistory = mockPortfolioHistory.map((p) => ({ ...p }))
    liveTransactionsExtra = []
  }
  return liveHoldings
}

function deepCopyHoldings(from: Holding[]): Holding[] {
  return from.map((h) => ({ ...h, asset: { ...h.asset } }))
}

export function snapshotLiveHoldings(portfolioId: string): Holding[] {
  const data = ensureHydrated(portfolioId)
  if (!data) {
    return portfolioId === mockPortfolio.id
      ? deepCopyHoldings(mockHoldings)
      : []
  }
  return deepCopyHoldings(data)
}

/** Coste total invertido según valor medio de compra (proxy educativo mock). */
function totalCostBasis(holdings: Holding[]): number {
  return holdings.reduce((s, h) => s + h.quantity * h.avgBuyPrice, 0)
}

function recomputeHoldingMarks(holding: Holding, assetPrice: number) {
  const cost = holding.quantity * holding.avgBuyPrice
  holding.currentValue = holding.quantity * assetPrice
  holding.profitLoss = holding.currentValue - cost
  holding.profitLossPercent =
    cost > 1e-9 ? (holding.profitLoss / cost) * 100 : 0
}

function reallocate(holdings: Holding[]) {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0)
  holdings.forEach((h) => {
    h.allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0
  })
}

function totalsFromHoldings(holdings: Holding[]) {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0)
  const cost = totalCostBasis(holdings)
  const totalProfitLoss = totalValue - cost
  const totalProfitLossPercent =
    cost > 1e-9 ? (totalProfitLoss / cost) * 100 : 0
  return { totalValue, totalProfitLoss, totalProfitLossPercent }
}

export function snapshotLiveTotals(portfolioId: string): {
  totalValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
} {
  const holdingsSnapshot = snapshotLiveHoldings(portfolioId)
  if (holdingsSnapshot.length === 0) {
    return {
      totalValue: mockPortfolio.totalValue,
      totalProfitLoss: mockPortfolio.totalProfitLoss,
      totalProfitLossPercent: mockPortfolio.totalProfitLossPercent,
    }
  }
  return totalsFromHoldings(holdingsSnapshot)
}

export function snapshotLiveAllocation(portfolioId: string): AllocationItem[] {
  const holdingsSnapshot = snapshotLiveHoldings(portfolioId)
  if (holdingsSnapshot.length === 0) return [...mockAllocationData]
  const totalValue = holdingsSnapshot.reduce((s, h) => s + h.currentValue, 0)
  if (totalValue <= 0) return []
  return holdingsSnapshot.map((h) => ({
    name: h.asset.symbol,
    value: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0,
    color: getAssetTypeColor(h.asset.type),
  }))
}

export function snapshotLivePerformance(
  portfolioId: string
): PortfolioPerformancePoint[] {
  ensureHydrated(portfolioId)
  if (portfolioId !== mockPortfolio.id) return []
  const src =
    portfolioId === mockPortfolio.id && liveHistory
      ? liveHistory
      : mockPortfolioHistory
  return src.map((p) => ({ ...p }))
}

function bumpHistory(totalValue: number) {
  if (!liveHistory || liveHistory.length === 0) return
  const last = liveHistory[liveHistory.length - 1]!
  last.value = totalValue
}

export function snapshotLiveTransactions(portfolioId: string): Transaction[] {
  const base = mockTransactions.filter(
    (tx) => tx.portfolioId === portfolioId
  )
  const extra = liveTransactionsExtra.filter(
    (tx) => tx.portfolioId === portfolioId
  )
  return [...base, ...extra].sort(
    (a, b) =>
      new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  )
}

export function appendLiveMockTransaction(tx: Transaction): void {
  const holdings = ensureHydrated(tx.portfolioId)
  if (!holdings) return

  const asset = tx.asset ?? getAsset(tx.assetId)

  const idx = holdings.findIndex((h) => h.assetId === tx.assetId)
  let holding: Holding

  if (idx < 0) {
    if (tx.type === 'SELL' || tx.quantity <= 0) return
    if (!asset) return
    holding = {
      id: `h_live_${tx.assetId}_${Date.now()}`,
      assetId: tx.assetId,
      asset: { ...asset },
      quantity: 0,
      avgBuyPrice: 0,
      currentValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      allocation: 0,
    }
    holdings.push(holding)
  } else {
    holding = holdings[idx]!
  }

  const q = tx.quantity
  const price = tx.price

  if (tx.type === 'BUY') {
    const totalQty = holding.quantity + q
    if (totalQty <= 0) return
    holding.avgBuyPrice =
      (holding.quantity * holding.avgBuyPrice + q * price) / totalQty
    holding.quantity = totalQty
    if (asset) holding.asset = { ...asset }
  } else {
    const sellQty = Math.min(q, holding.quantity)
    if (sellQty <= 0) return
    holding.quantity -= sellQty
    if (holding.quantity <= 1e-10 && idx >= 0) {
      holdings.splice(idx, 1)
    } else if (asset) {
      holding.asset = { ...asset }
    }
  }

  holdings.forEach((h) => {
    const p = getAsset(h.assetId)?.price ?? h.asset.price
    recomputeHoldingMarks(h, p)
  })
  reallocate(holdings)
  const totals = totalsFromHoldings(holdings)
  bumpHistory(totals.totalValue)
  liveTransactionsExtra.push(tx)
}

export function liveMockPortfolioSummary(portfolioId: string): PortfolioSummary {
  const sorted = [...snapshotLiveHoldings(portfolioId)].sort(
    (a, b) => b.profitLossPercent - a.profitLossPercent
  )
  const perf = snapshotLivePerformance(portfolioId)
  let dailyReturn = 0
  if (perf.length >= 2) {
    const last = perf[perf.length - 1]!.value
    const prev = perf[perf.length - 2]!.value
    if (prev !== 0) dailyReturn = ((last - prev) / prev) * 100
  }
  const totals = snapshotLiveTotals(portfolioId)

  return {
    portfolioId,
    totalValue: totals.totalValue,
    totalProfitLoss: totals.totalProfitLoss,
    totalProfitLossPercent: totals.totalProfitLossPercent,
    dailyReturn,
    monthlyReturn: mockPortfolio.monthlyReturn,
    aiRiskScore: 62,
    bestAsset: sorted[0]?.asset.symbol ?? '—',
    worstAsset: sorted[sorted.length - 1]?.asset.symbol ?? '—',
  }
}
