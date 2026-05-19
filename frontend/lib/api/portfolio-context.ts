import { apiGet } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { NoPortfolioError } from '@/lib/errors/no-portfolio-error'
import { IS_MOCK_MODE } from '@/lib/config'
import type { BackendPortfolio } from '@/lib/api/backend-types'
import { mockPortfolio } from '@/lib/mock-data'

const ACTIVE_PORTFOLIO_KEY = 'aurex_active_portfolio_id'

export function getCachedPortfolioId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ACTIVE_PORTFOLIO_KEY)
}

export function setCachedPortfolioId(id: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ACTIVE_PORTFOLIO_KEY, id)
  }
}

/**
 * ID de portafolio activo: explícito, caché de sesión, primer portafolio del API o mock.
 */
export async function resolvePortfolioId(explicitId?: string): Promise<string> {
  if (explicitId) {
    setCachedPortfolioId(explicitId)
    return explicitId
  }

  if (IS_MOCK_MODE) {
    const cached = getCachedPortfolioId()
    return cached ?? mockPortfolio.id
  }

  const cached = getCachedPortfolioId()
  if (cached) return cached

  const portfolios = await apiGet<BackendPortfolio[]>(API_ENDPOINTS.portfolios.list)
  const first = portfolios[0]
  if (!first) {
    throw new NoPortfolioError()
  }

  setCachedPortfolioId(first.id)
  return first.id
}
