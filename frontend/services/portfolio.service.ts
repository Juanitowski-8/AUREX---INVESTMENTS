import { apiGet, apiPost } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { mockDelay } from '@/lib/api/delay'
import type {
  BackendHolding,
  BackendPortfolio,
  BackendPortfolioSummary,
  BackendTransaction,
} from '@/lib/api/backend-types'
import {
  buildPerformanceFromHistory,
  mapAllocation,
  mapCreateTransactionBody,
  mapHolding,
  mapPortfolioDetail,
  mapPortfolioSummary,
  mapTransaction,
} from '@/lib/api/mappers'
import { resolvePortfolioId } from '@/lib/api/portfolio-context'
import { withDataSource } from '@/lib/api/with-data-source'
import { getMarketHistory } from '@/services/market.service'
import {
  mockAllocationData,
  mockHoldings,
  mockPortfolio,
  mockPortfolioHistory,
  mockTransactions,
} from '@/lib/mock-data'
import type {
  AllocationItem,
  Holding,
  PortfolioPerformancePoint,
  Transaction,
} from '@/types'
import type { PortfolioDetail, PortfolioSummary } from '@/types/api'

function computeDailyReturn(history: PortfolioPerformancePoint[]): number {
  if (history.length < 2) return 0
  const last = history[history.length - 1]!.value
  const prev = history[history.length - 2]!.value
  if (prev === 0) return 0
  return ((last - prev) / prev) * 100
}

function buildMockSummary(portfolioId: string): PortfolioSummary {
  const sorted = [...mockHoldings].sort(
    (a, b) => b.profitLossPercent - a.profitLossPercent
  )
  return {
    portfolioId,
    totalValue: mockPortfolio.totalValue,
    totalProfitLoss: mockPortfolio.totalProfitLoss,
    totalProfitLossPercent: mockPortfolio.totalProfitLossPercent,
    dailyReturn: computeDailyReturn(mockPortfolioHistory),
    monthlyReturn: mockPortfolio.monthlyReturn,
    aiRiskScore: 62,
    bestAsset: sorted[0]?.asset.symbol ?? '—',
    worstAsset: sorted[sorted.length - 1]?.asset.symbol ?? '—',
  }
}

export type CreatePortfolioInput = {
  name: string
  baseCurrency?: string
  description?: string
}

/** POST /api/portfolios */
export async function createPortfolio(
  input: CreatePortfolioInput
): Promise<PortfolioDetail> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = `portfolio_${Date.now()}`
      return {
        id,
        name: input.name,
        createdAt: new Date().toISOString(),
      }
    },
    async () => {
      const raw = await apiPost<BackendPortfolio>(API_ENDPOINTS.portfolios.list, {
        name: input.name,
        baseCurrency: input.baseCurrency ?? 'USD',
        ...(input.description?.trim()
          ? { description: input.description.trim() }
          : {}),
      })
      return mapPortfolioDetail(raw)
    },
    { fallbackToMockOnError: false }
  )
}

/** GET /api/portfolios */
export async function listPortfolios(): Promise<PortfolioDetail[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return [
        {
          id: mockPortfolio.id,
          name: mockPortfolio.name,
          createdAt: mockPortfolio.createdAt,
        },
      ]
    },
    async () => {
      const raw = await apiGet<BackendPortfolio[]>(API_ENDPOINTS.portfolios.list)
      return raw.map(mapPortfolioDetail)
    }
  )
}

/** GET /api/portfolios/{id} */
export async function getPortfolio(portfolioId?: string): Promise<PortfolioDetail> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = portfolioId ?? mockPortfolio.id
      if (id !== mockPortfolio.id) {
        return { id, name: 'Portfolio', createdAt: new Date().toISOString() }
      }
      return {
        id: mockPortfolio.id,
        name: mockPortfolio.name,
        createdAt: mockPortfolio.createdAt,
      }
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiGet<BackendPortfolio>(API_ENDPOINTS.portfolios.detail(id))
      return mapPortfolioDetail(raw)
    }
  )
}

/** GET /api/portfolios/{id}/summary */
export async function getPortfolioSummary(
  portfolioId?: string
): Promise<PortfolioSummary> {
  return withDataSource(
    async () => {
      await mockDelay()
      return buildMockSummary(portfolioId ?? mockPortfolio.id)
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiGet<BackendPortfolioSummary>(
        API_ENDPOINTS.portfolios.summary(id)
      )
      return mapPortfolioSummary(raw)
    }
  )
}

/** GET /api/portfolios/{id}/holdings */
export async function getPortfolioHoldings(
  portfolioId?: string
): Promise<Holding[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = portfolioId ?? mockPortfolio.id
      if (id !== mockPortfolio.id) return []
      return [...mockHoldings]
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiGet<BackendHolding[]>(API_ENDPOINTS.portfolios.holdings(id))
      return raw.map(mapHolding)
    }
  )
}

/** Derivado en modo API: historial BTC escalado al valor del portafolio. */
export async function getPortfolioPerformance(
  portfolioId?: string
): Promise<PortfolioPerformancePoint[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = portfolioId ?? mockPortfolio.id
      if (id !== mockPortfolio.id) return []
      return [...mockPortfolioHistory]
    },
    async () => {
      const summary = await getPortfolioSummary(portfolioId)
      const history = await getMarketHistory('BTC')
      return buildPerformanceFromHistory(history, summary.totalValue)
    }
  )
}

/** Derivado en modo API desde allocation del summary. */
export async function getPortfolioAllocation(
  portfolioId?: string
): Promise<AllocationItem[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = portfolioId ?? mockPortfolio.id
      if (id !== mockPortfolio.id) return []
      return [...mockAllocationData]
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiGet<BackendPortfolioSummary>(
        API_ENDPOINTS.portfolios.summary(id)
      )
      return mapAllocation(raw)
    }
  )
}

export type CreateTransactionInput = {
  portfolioId: string
  assetId: string
  type: Transaction['type']
  quantity: number
  price: number
  transactionDate?: string
  notes?: string
}

/** POST /api/transactions */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  return withDataSource(
    async () => {
      await mockDelay(400)
      const holding = mockHoldings.find((h) => h.assetId === input.assetId)
      const asset = holding?.asset ?? mockHoldings[0]!.asset
      return {
        id: `tx_${Date.now()}`,
        portfolioId: input.portfolioId,
        assetId: input.assetId,
        asset,
        type: input.type,
        quantity: input.quantity,
        price: input.price,
        total: input.quantity * input.price,
        executedAt: new Date().toISOString(),
      }
    },
    async () => {
      const raw = await apiPost<BackendTransaction>(
        API_ENDPOINTS.transactions.create,
        mapCreateTransactionBody(input)
      )
      return mapTransaction(raw)
    },
    { fallbackToMockOnError: false }
  )
}

/** GET /api/transactions?portfolioId={id} */
export async function getTransactions(portfolioId?: string): Promise<Transaction[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = portfolioId ?? mockPortfolio.id
      return mockTransactions
        .filter((tx) => tx.portfolioId === id)
        .sort(
          (a, b) =>
            new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
        )
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiGet<BackendTransaction[]>(API_ENDPOINTS.transactions.list, {
        params: { portfolioId: id },
      })
      return raw.map(mapTransaction)
    }
  )
}
