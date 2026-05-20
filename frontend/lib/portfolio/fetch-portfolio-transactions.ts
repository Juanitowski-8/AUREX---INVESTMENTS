import { apiGet } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { mockDelay } from '@/lib/api/delay'
import type { BackendTransaction } from '@/lib/api/backend-types'
import { mapTransaction } from '@/lib/api/mappers'
import { resolvePortfolioId } from '@/lib/api/portfolio-context'
import { withDataSource } from '@/lib/api/with-data-source'
import { getMockTransactions } from '@/lib/mock-portfolio-store'
import { mockPortfolio } from '@/lib/mock-data'
import {
  mergeTransactionsWithRecent,
  reconcileRecentTransactions,
  sanitizeTransactionsForPortfolio,
} from '@/lib/portfolio/transaction-sync'
import type { Transaction } from '@/types'

const inflight = new Map<
  string,
  Promise<{ transactions: Transaction[]; excludedCount: number }>
>()

let lastExcludedCount = 0

export function getLastExcludedTransactionCount(): number {
  return lastExcludedCount
}

export function clearTransactionFetchCache(portfolioId?: string): void {
  if (portfolioId === undefined) {
    inflight.clear()
    return
  }
  inflight.delete(portfolioId ?? 'default')
}

async function fetchTransactionsLive(portfolioId: string): Promise<Transaction[]> {
  const id = await resolvePortfolioId(portfolioId)
  const raw = await apiGet<BackendTransaction[]>(API_ENDPOINTS.transactions.list, {
    params: { portfolioId: id },
    noCache: true,
  })
  const mapped = raw.map(mapTransaction)
  reconcileRecentTransactions(id, mapped)
  return mergeTransactionsWithRecent(id, mapped)
}

/** Una sola lectura de transacciones por portafolio (evita carreras entre summary y holdings). */
export async function fetchPortfolioTransactions(
  portfolioId?: string
): Promise<{ transactions: Transaction[]; excludedCount: number }> {
  const run = async (): Promise<{ transactions: Transaction[]; excludedCount: number }> => {
    const list = await withDataSource(
      async () => {
        await mockDelay(80)
        const id = portfolioId ?? mockPortfolio.id
        return getMockTransactions(id)
      },
      () => fetchTransactionsLive(portfolioId!),
      { fallbackToMockOnError: false }
    )

    const { valid, excluded } = sanitizeTransactionsForPortfolio(list)
    lastExcludedCount = excluded
    return { transactions: valid, excludedCount: excluded }
  }

  const key = portfolioId ?? 'default'
  const pending = inflight.get(key)
  if (pending) {
    return pending
  }

  const promise = run().finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, promise)
  return promise
}
