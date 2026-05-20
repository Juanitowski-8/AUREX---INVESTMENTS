import { mockDelay } from '@/lib/api/delay'
import { withDataSource } from '@/lib/api/with-data-source'
import { buildAdvisoryAlertsFromAnalysis } from '@/lib/ai/build-advisory-alerts'
import {
  getStoredAdvisories,
  mergeAdvisoriesFromReport,
} from '@/lib/ai-advisory-store'
import type { AIAdvisoryAlert, AIReport, Holding } from '@/types'

export async function getAIAdvisories(
  portfolioId: string
): Promise<AIAdvisoryAlert[]> {
  return withDataSource(
    async () => {
      await mockDelay(80)
      return getStoredAdvisories(portfolioId)
    },
    async () => getStoredAdvisories(portfolioId),
    { fallbackToMockOnError: true }
  )
}

/** Tras generar análisis, crea alertas de consejo y las persiste. */
export async function syncAIAdvisoriesFromReport(
  portfolioId: string,
  report: AIReport,
  holdings: Holding[]
): Promise<AIAdvisoryAlert[]> {
  const built = buildAdvisoryAlertsFromAnalysis(portfolioId, holdings, report)
  return withDataSource(
    async () => mergeAdvisoriesFromReport(portfolioId, report.id, built),
    async () => mergeAdvisoriesFromReport(portfolioId, report.id, built),
    { fallbackToMockOnError: true }
  )
}
