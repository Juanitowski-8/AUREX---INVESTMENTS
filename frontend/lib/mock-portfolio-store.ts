import {
  computeHoldingsFromTransactions,
} from '@/lib/portfolio/holdings-from-transactions'
import {
  loadExtraMockPortfolios,
  loadMockTransactions,
  saveExtraMockPortfolios,
  saveMockTransactions,
  type StoredMockPortfolio,
} from '@/lib/mock-storage'
import { mockPortfolio } from '@/lib/mock-data'
import type { Holding, Transaction } from '@/types'
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

/** Holdings derivados solo de tus transacciones + precios de mercado actuales. */
export function getMockHoldingsFromTransactions(portfolioId: string): Holding[] {
  const txs = getMockTransactions(portfolioId)
  return computeHoldingsFromTransactions(txs)
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
