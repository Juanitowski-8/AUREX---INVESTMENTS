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
import { normalizePortfolioId } from '@/lib/portfolio/portfolio-id'
import {
  appendLiveMockTransaction,
  liveMockPortfolioSummary,
  snapshotLiveAllocation,
  snapshotLiveHoldings,
  snapshotLivePerformance,
  snapshotLiveTransactions,
} from '@/lib/portfolio/live-mock-portfolio'
import { getMarketHistory } from '@/services/market.service'
import { getAsset, mockHoldings, mockPortfolio } from '@/lib/mock-data'
import type {
  AllocationItem,
  Holding,
  PortfolioPerformancePoint,
  Transaction,
} from '@/types'
import type { PortfolioDetail, PortfolioSummary } from '@/types/api'

function buildMockSummary(portfolioId: string): PortfolioSummary {
  return liveMockPortfolioSummary(portfolioId)
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
      return snapshotLiveHoldings(id)
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
      return snapshotLivePerformance(id)
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
      return snapshotLiveAllocation(id)
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
}

/** POST /api/transactions */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  return withDataSource(
    async () => {
      await mockDelay(400)
      const asset =
        getAsset(input.assetId) ??
        mockHoldings.find((h) => h.assetId === input.assetId)?.asset ??
        mockHoldings[0]!.asset
      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        portfolioId: normalizePortfolioId(input.portfolioId),
        assetId: input.assetId,
        asset,
        type: input.type,
        quantity: input.quantity,
        price: input.price,
        total: input.quantity * input.price,
        executedAt: new Date().toISOString(),
      }
      appendLiveMockTransaction(tx)
      return tx
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
      return snapshotLiveTransactions(id)
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
