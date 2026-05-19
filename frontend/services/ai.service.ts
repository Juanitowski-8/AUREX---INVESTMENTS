import { apiGet, apiPost } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { mockDelay } from '@/lib/api/delay'
import type { BackendAIAnalysis } from '@/lib/api/backend-types'
import { mapAIReport } from '@/lib/api/mappers'
import { resolvePortfolioId } from '@/lib/api/portfolio-context'
import { withDataSource } from '@/lib/api/with-data-source'
import {
  computeConcentration,
  computeMarketExposure,
} from '@/lib/ai/portfolio-exposure'
import {
  mockAIInsights,
  mockAIReports,
  mockHoldings,
  mockPortfolio,
} from '@/lib/mock-data'
import type { AIInsight, AIReport } from '@/types'

let reportsStore = [...mockAIReports]

function buildEducationalObservations(portfolioId: string): string[] {
  const holdings =
    portfolioId === mockPortfolio.id ? [...mockHoldings] : []
  const { top3Pct, largest } = computeConcentration(holdings)
  const exposure = computeMarketExposure(holdings)
  const crypto = exposure.find((e) => e.type === 'CRYPTO')

  return [
    largest
      ? `${largest.asset.symbol} is the largest position at ${largest.allocation.toFixed(1)}% of portfolio weight`
      : 'Portfolio concentration data is unavailable in this mock snapshot',
    `Top three holdings represent ${top3Pct.toFixed(1)}% of total allocation`,
    crypto
      ? `${crypto.label} sleeve accounts for ${crypto.allocation.toFixed(1)}% of market exposure`
      : 'Market exposure by asset class is evenly distributed in the simulated book',
    'Figures are simulated for education — not a directive to trade or rebalance',
  ]
}

function sortReports(reports: AIReport[]): AIReport[] {
  return [...reports].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/** Insights de dashboard — solo mock (sin endpoint en backend). */
export async function getAIInsights(): Promise<AIInsight[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return [...mockAIInsights]
    },
    async () => []
  )
}

/** GET /api/ai/analyses */
export async function getAIReports(): Promise<AIReport[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return sortReports(reportsStore)
    },
    async () => {
      const raw = await apiGet<BackendAIAnalysis[]>(API_ENDPOINTS.ai.analyses)
      return sortReports(raw.map(mapAIReport))
    }
  )
}

/** GET /api/ai/analyses/{id} */
export async function getAIReport(id: string): Promise<AIReport | null> {
  return withDataSource(
    async () => {
      await mockDelay()
      return reportsStore.find((report) => report.id === id) ?? null
    },
    async () => {
      try {
        const raw = await apiGet<BackendAIAnalysis>(API_ENDPOINTS.ai.analysis(id))
        return mapAIReport(raw)
      } catch {
        return null
      }
    },
    { fallbackToMockOnError: false }
  )
}

/** POST /api/ai/portfolio-summary/{portfolioId} */
export async function generatePortfolioAnalysis(
  portfolioId?: string
): Promise<AIReport> {
  return withDataSource(
    async () => {
      await mockDelay(600)
      const id = portfolioId ?? mockPortfolio.id
      const latestInsight = mockAIInsights[0]!
      const created: AIReport = {
        id: `report_${Date.now()}`,
        portfolioId: id,
        title: 'Portfolio intelligence snapshot',
        summary: latestInsight.content,
        riskScore: latestInsight.riskScore,
        riskLevel: latestInsight.riskLevel,
        observations: buildEducationalObservations(id),
        createdAt: new Date().toISOString(),
      }

      reportsStore = [created, ...reportsStore]
      return created
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiPost<BackendAIAnalysis>(
        API_ENDPOINTS.ai.portfolioSummary(id)
      )
      return mapAIReport(raw)
    },
    { fallbackToMockOnError: false }
  )
}
