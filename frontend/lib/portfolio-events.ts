export const PORTFOLIO_UPDATED_EVENT = 'aurex-portfolio-updated'

export type PortfolioUpdatedDetail = {
  portfolioId: string
}

export function dispatchPortfolioUpdated(portfolioId: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<PortfolioUpdatedDetail>(PORTFOLIO_UPDATED_EVENT, {
      detail: { portfolioId },
    })
  )
}

export function subscribePortfolioUpdated(
  handler: (detail: PortfolioUpdatedDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => undefined

  const listener = (event: Event) => {
    const custom = event as CustomEvent<PortfolioUpdatedDetail>
    if (custom.detail?.portfolioId) handler(custom.detail)
  }

  window.addEventListener(PORTFOLIO_UPDATED_EVENT, listener)
  return () => window.removeEventListener(PORTFOLIO_UPDATED_EVENT, listener)
}
