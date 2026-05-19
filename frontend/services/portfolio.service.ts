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
import {
  addMockTransaction,
  getMockHoldingsFromTransactions,
  getMockSummaryFromHoldings,
  getMockTransactions,
  listMockPortfolios,
  registerMockPortfolio,
} from '@/lib/mock-portfolio-store'
import { resolvePortfolioId } from '@/lib/api/portfolio-context'
import { withDataSource } from '@/lib/api/with-data-source'
import { getMarketHistory } from '@/services/market.service'
import {
  mockAllocationData,
  mockAssets,
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

export type PortfolioFetchOptions = {
  /** Refresca datos desde el servidor sin caché del navegador. */
  reload?: boolean
}

function apiFetchOptions(options?: PortfolioFetchOptions) {
  return options?.reload ? { noCache: true as const } : undefined
}

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
      const createdAt = new Date().toISOString()
      registerMockPortfolio(id, input.name, createdAt)
      return {
        id,
        name: input.name,
        createdAt,
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
      return listMockPortfolios()
    },
    async () => {
      const raw = await apiGet<BackendPortfolio[]>(API_ENDPOINTS.portfolios.list)
      return raw.map(mapPortfolioDetail)
    },
    { fallbackToMockOnError: false }
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
    },
    { fallbackToMockOnError: false }
  )
}

/** GET /api/portfolios/{id}/summary */
export async function getPortfolioSummary(
  portfolioId?: string,
  options?: PortfolioFetchOptions
): Promise<PortfolioSummary> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = portfolioId ?? mockPortfolio.id
      const holdings = getMockHoldingsFromTransactions(id)
      if (holdings.length > 0 || getMockTransactions(id).length > 0) {
        return getMockSummaryFromHoldings(id, holdings)
      }
      if (id === mockPortfolio.id) return buildMockSummary(id)
      return getMockSummaryFromHoldings(id, [])
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiGet<BackendPortfolioSummary>(
        API_ENDPOINTS.portfolios.summary(id),
        apiFetchOptions(options)
      )
      return mapPortfolioSummary(raw)
    },
    { fallbackToMockOnError: false }
  )
}

/** GET /api/portfolios/{id}/holdings */
export async function getPortfolioHoldings(
  portfolioId?: string,
  options?: PortfolioFetchOptions
): Promise<Holding[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      const id = portfolioId ?? mockPortfolio.id
      const fromTx = getMockHoldingsFromTransactions(id)
      if (fromTx.length > 0 || getMockTransactions(id).length > 0) return fromTx
      if (id === mockPortfolio.id) return [...mockHoldings]
      return []
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiGet<BackendHolding[]>(
        API_ENDPOINTS.portfolios.holdings(id),
        apiFetchOptions(options)
      )
      return raw.map(mapHolding)
    },
    { fallbackToMockOnError: false }
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
      const holdings = getMockHoldingsFromTransactions(id)
      if (holdings.length > 0 || getMockTransactions(id).length > 0) {
        const summary = getMockSummaryFromHoldings(id, holdings)
        const history = await getMarketHistory('BTC')
        return buildPerformanceFromHistory(history, summary.totalValue)
      }
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
      const holdings = getMockHoldingsFromTransactions(id)
      if (holdings.length > 0 || getMockTransactions(id).length > 0) {
        const palette = ['#C9A227', '#00D084', '#3B82F6', '#A855F7', '#F97316', '#EC4899']
        return holdings.map((h, i) => ({
          name: h.asset.symbol,
          value: h.allocation,
          color: palette[i % palette.length],
        }))
      }
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
      const symbol = input.assetId.toUpperCase()
      const asset =
        mockAssets.find((a) => a.symbol === symbol) ??
        mockHoldings.find((h) => h.asset.symbol === symbol)?.asset ?? {
          id: symbol.toLowerCase(),
          symbol,
          name: symbol,
          type: 'CRYPTO' as const,
          price: input.price,
          change24h: 0,
          marketCap: 0,
          volume24h: 0,
        }
      const executedAt = input.transactionDate ?? new Date().toISOString()
      const created: Transaction = {
        id: `tx_${Date.now()}`,
        portfolioId: input.portfolioId,
        assetId: symbol,
        asset,
        type: input.type,
        quantity: input.quantity,
        price: input.price,
        total: input.quantity * input.price,
        executedAt,
      }
      addMockTransaction(created)
      return created
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
