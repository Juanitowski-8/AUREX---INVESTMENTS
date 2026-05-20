'use client'

import { useEffect } from 'react'
import type { PortfolioUpdatedDetail } from '@/lib/portfolio/portfolio-events'
import { PORTFOLIO_UPDATED_EVENT } from '@/lib/portfolio/portfolio-events'
import { portfolioIdsEqual } from '@/lib/portfolio/portfolio-id'

/**
 * Ejecuta onRefresh cuando otra vista crea una transacción (`dispatchPortfolioUpdated`).
 * Si portfolioId está definido, solo reacciona a eventos del mismo portafolio.
 */
export function usePortfolioUpdatedListener(
  portfolioId: string | null | undefined,
  onRefresh: () => void
) {
  useEffect(() => {
    const handler = (ev: Event) => {
      const ce = ev as CustomEvent<PortfolioUpdatedDetail>
      const eventPid = ce.detail?.portfolioId

      const scoped =
        portfolioId != null &&
        portfolioId !== '' &&
        eventPid != null &&
        eventPid !== '' &&
        !portfolioIdsEqual(eventPid, portfolioId)

      if (scoped) return
      onRefresh()
    }

    window.addEventListener(PORTFOLIO_UPDATED_EVENT, handler as EventListener)
    return () =>
      window.removeEventListener(PORTFOLIO_UPDATED_EVENT, handler as EventListener)
  }, [portfolioId, onRefresh])
}
