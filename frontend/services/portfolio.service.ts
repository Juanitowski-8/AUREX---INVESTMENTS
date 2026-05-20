import { apiDelete, apiGet, apiPost } from '@/lib/api-client'
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
  deleteMockTransaction,
  getMockHoldingsFromTransactions,
  getMockSummaryFromHoldings,
  getMockTransactions,
  listMockPortfolios,
  registerMockPortfolio,
} from '@/lib/mock-portfolio-store'
import { resolvePortfolioId } from '@/lib/api/portfolio-context'
import { withDataSource } from '@/lib/api/with-data-source'
import { refreshLiveMarketCache } from '@/lib/live-market-cache'
import {
  clearTransactionFetchCache,
  fetchPortfolioTransactions,
} from '@/lib/portfolio/fetch-portfolio-transactions'
import {
  assertSaneTransactionQuantity,
  computeHoldingsFromTransactions,
} from '@/lib/portfolio/holdings-from-transactions'
import { registerRecentTransaction } from '@/lib/portfolio/transaction-sync'
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
      await refreshLiveMarketCache()
      const id = portfolioId ?? mockPortfolio.id
      const holdings = getMockHoldingsFromTransactions(id)
      return getMockSummaryFromHoldings(id, holdings)
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      await refreshLiveMarketCache()
      const { transactions: txs } = await fetchPortfolioTransactions(id)
      const holdings = computeHoldingsFromTransactions(txs)
      return getMockSummaryFromHoldings(id, holdings)
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
      await refreshLiveMarketCache()
      const id = portfolioId ?? mockPortfolio.id
      return getMockHoldingsFromTransactions(id)
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      await refreshLiveMarketCache()
      const { transactions: txs } = await fetchPortfolioTransactions(id)
      return computeHoldingsFromTransactions(txs)
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
      await refreshLiveMarketCache()
      const holdings = getMockHoldingsFromTransactions(id)
      if (holdings.length === 0) return []
      const summary = getMockSummaryFromHoldings(id, holdings)
      const history = await getMarketHistory('BTC')
      return buildPerformanceFromHistory(history, summary.totalValue)
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
      await refreshLiveMarketCache()
      const holdings = getMockHoldingsFromTransactions(id)
      const palette = ['#C9A227', '#00D084', '#3B82F6', '#A855F7', '#F97316', '#EC4899']
      return holdings.map((h, i) => ({
        name: h.asset.symbol,
        value: h.allocation,
        color: palette[i % palette.length],
      }))
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      await refreshLiveMarketCache()
      const { transactions: txs } = await fetchPortfolioTransactions(id)
      const holdings = computeHoldingsFromTransactions(txs)
      const palette = ['#C9A227', '#00D084', '#3B82F6', '#A855F7', '#F97316', '#EC4899']
      return holdings.map((h, i) => ({
        name: h.asset.symbol,
        value: h.allocation,
        color: palette[i % palette.length],
      }))
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
      assertSaneTransactionQuantity(input.quantity, symbol)
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
      if (input.type === 'SELL') {
        const holdings = getMockHoldingsFromTransactions(input.portfolioId)
        const held = holdings.find(
          (h) => h.asset.symbol.toUpperCase() === symbol
        )
        const available = held?.quantity ?? 0
        if (available <= 0) {
          throw new Error(
            `You do not hold any ${symbol}. Buy ${symbol} first before selling.`
          )
        }
        if (input.quantity > available + 1e-9) {
          throw new Error(
            `Insufficient ${symbol}. You hold ${available}, cannot sell ${input.quantity}.`
          )
        }
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
      registerRecentTransaction(created)
      clearTransactionFetchCache(input.portfolioId)
      return created
    },
    async () => {
      const symbol = input.assetId.toUpperCase()
      assertSaneTransactionQuantity(input.quantity, symbol)
      if (input.type === 'SELL') {
        await refreshLiveMarketCache()
        const { transactions: txs } = await fetchPortfolioTransactions(
          input.portfolioId
        )
        const held = computeHoldingsFromTransactions(txs).find(
          (h) => h.asset.symbol.toUpperCase() === symbol
        )
        const available = held?.quantity ?? 0
        if (available <= 0) {
          throw new Error(
            `You do not hold any ${symbol}. Buy ${symbol} first before selling.`
          )
        }
        if (input.quantity > available + 1e-9) {
          throw new Error(
            `Insufficient ${symbol}. You hold ${available}, cannot sell ${input.quantity}.`
          )
        }
      }
      const raw = await apiPost<BackendTransaction>(
        API_ENDPOINTS.transactions.create,
        mapCreateTransactionBody(input)
      )
      const created = mapTransaction(raw)
      registerRecentTransaction(created)
      clearTransactionFetchCache(input.portfolioId)
      return created
    },
    { fallbackToMockOnError: false }
  )
}

/** GET /api/transactions?portfolioId={id} */
export async function getTransactions(portfolioId?: string): Promise<Transaction[]> {
  const { transactions } = await fetchPortfolioTransactions(portfolioId)
  return transactions
}

/** DELETE /api/transactions/{id} — recalcula holdings en el servidor. */
export async function deleteTransaction(transactionId: string): Promise<void> {
  return withDataSource(
    async () => {
      await mockDelay(200)
      deleteMockTransaction(transactionId)
    },
    async () => {
      await apiDelete<void>(API_ENDPOINTS.transactions.delete(transactionId))
      clearTransactionFetchCache()
    },
    { fallbackToMockOnError: false }
  )
}
