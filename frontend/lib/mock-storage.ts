import type { Transaction } from '@/types'

const TX_KEY = 'aurex_mock_transactions'
const PORTFOLIOS_KEY = 'aurex_mock_portfolios'

export type StoredMockPortfolio = {
  id: string
  name: string
  createdAt: string
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadMockTransactions(): Record<string, Transaction[]> {
  return readJson<Record<string, Transaction[]>>(TX_KEY, {})
}

export function saveMockTransactions(data: Record<string, Transaction[]>) {
  writeJson(TX_KEY, data)
}

export function loadExtraMockPortfolios(): StoredMockPortfolio[] {
  return readJson<StoredMockPortfolio[]>(PORTFOLIOS_KEY, [])
}

export function saveExtraMockPortfolios(list: StoredMockPortfolio[]) {
  writeJson(PORTFOLIOS_KEY, list)
}
