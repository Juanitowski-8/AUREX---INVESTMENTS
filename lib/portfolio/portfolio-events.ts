import { normalizePortfolioId } from '@/lib/portfolio/portfolio-id'

export const PORTFOLIO_UPDATED_EVENT = 'aurex-portfolio-updated'

export type PortfolioUpdatedDetail = {
  portfolioId?: string
}

/** Notifica vistas del dashboard/portfolio tras crear o aplicar una transacción */
export function dispatchPortfolioUpdated(portfolioId?: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<PortfolioUpdatedDetail>(PORTFOLIO_UPDATED_EVENT, {
      detail: {
        portfolioId: portfolioId ? normalizePortfolioId(portfolioId) : undefined,
      },
    })
  )
}
