import { apiGet } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { IS_MOCK_MODE } from '@/lib/config'
import type { BackendPortfolio } from '@/lib/api/backend-types'
import { mockPortfolio } from '@/lib/mock-data'
import { normalizePortfolioId } from '@/lib/portfolio/portfolio-id'

const ACTIVE_PORTFOLIO_KEY = 'aurex_active_portfolio_id'

export function getCachedPortfolioId(): string | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(ACTIVE_PORTFOLIO_KEY)
  return raw ? normalizePortfolioId(raw) : null
}

export function setCachedPortfolioId(id: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ACTIVE_PORTFOLIO_KEY, normalizePortfolioId(id))
  }
}

/**
 * ID de portafolio activo: explícito, caché de sesión, primer portafolio del API o mock.
 */
export async function resolvePortfolioId(explicitId?: string): Promise<string> {
  if (explicitId) {
    const id = normalizePortfolioId(explicitId)
    setCachedPortfolioId(id)
    return id
  }

  if (IS_MOCK_MODE) {
    return normalizePortfolioId(mockPortfolio.id)
  }

  const cached = getCachedPortfolioId()
  if (cached) return cached

  const portfolios = await apiGet<BackendPortfolio[]>(API_ENDPOINTS.portfolios.list)
  const first = portfolios[0]
  if (!first) {
    throw new Error('No portfolio found for the current user')
  }

  const id = normalizePortfolioId(first.id)
  setCachedPortfolioId(id)
  return id
}
