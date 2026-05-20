import { apiGet, apiPost } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { mockDelay } from '@/lib/api/delay'
import type { BackendAIAnalysis } from '@/lib/api/backend-types'
import {
  buildAnalysisTitle,
  buildPortfolioAnalysisObservations,
  buildPortfolioAnalysisSummary,
  computeRiskScore,
  scoreToRiskLevel,
} from '@/lib/ai/build-portfolio-analysis'
import { mapAIReport } from '@/lib/api/mappers'
import {
  getMockHoldingsFromTransactions,
  getMockTransactions,
} from '@/lib/mock-portfolio-store'
import { resolvePortfolioId } from '@/lib/api/portfolio-context'
import { withDataSource } from '@/lib/api/with-data-source'
import {
  mockAIInsights,
  mockAIReports,
  mockHoldings,
  mockPortfolio,
} from '@/lib/mock-data'
import { syncAIAdvisoriesFromReport } from '@/services/ai-advisory.service'
import { getPortfolioHoldings } from '@/services/portfolio.service'
import type { AIInsight, AIReport, Holding } from '@/types'

let reportsStore = [...mockAIReports]

function sortReports(reports: AIReport[]): AIReport[] {
  return [...reports].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function filterReportsByPortfolio(
  reports: AIReport[],
  portfolioId?: string
): AIReport[] {
  if (!portfolioId) return reports
  return reports.filter((r) => r.portfolioId === portfolioId)
}

async function resolveHoldingsForAnalysis(portfolioId: string): Promise<Holding[]> {
  return withDataSource(
    async () => {
      const fromTx = getMockHoldingsFromTransactions(portfolioId)
      if (fromTx.length > 0 || getMockTransactions(portfolioId).length > 0) {
        return fromTx
      }
      if (portfolioId === mockPortfolio.id) return [...mockHoldings]
      return []
    },
    async () => getPortfolioHoldings(portfolioId, { reload: true })
  )
}

function buildReportFromHoldings(
  portfolioId: string,
  holdings: Holding[]
): AIReport {
  const createdAt = new Date().toISOString()
  const riskScore = computeRiskScore(holdings)
  return {
    id: `report_${Date.now()}`,
    portfolioId,
    title: buildAnalysisTitle(createdAt),
    summary: buildPortfolioAnalysisSummary(holdings),
    riskScore,
    riskLevel: scoreToRiskLevel(riskScore),
    observations: buildPortfolioAnalysisObservations(holdings),
    createdAt,
  }
}

/** Insights de dashboard — mock local; en API el dashboard usa el último reporte. */
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
export async function getAIReports(portfolioId?: string): Promise<AIReport[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return sortReports(filterReportsByPortfolio(reportsStore, portfolioId))
    },
    async () => {
      const raw = await apiGet<BackendAIAnalysis[]>(API_ENDPOINTS.ai.analyses, {
        noCache: true,
      })
      const mapped = sortReports(raw.map(mapAIReport))
      return filterReportsByPortfolio(mapped, portfolioId)
    },
    { fallbackToMockOnError: false }
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
        const raw = await apiGet<BackendAIAnalysis>(API_ENDPOINTS.ai.analysis(id), {
          noCache: true,
        })
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
      const holdings = await resolveHoldingsForAnalysis(id)
      const created = buildReportFromHoldings(id, holdings)
      reportsStore = [
        created,
        ...reportsStore.filter((r) => r.id !== created.id),
      ]
      await syncAIAdvisoriesFromReport(id, created, holdings)
      return created
    },
    async () => {
      const id = await resolvePortfolioId(portfolioId)
      const raw = await apiPost<BackendAIAnalysis>(
        API_ENDPOINTS.ai.portfolioSummary(id)
      )
      const report = mapAIReport(raw)
      const holdings = await resolveHoldingsForAnalysis(id)
      await syncAIAdvisoriesFromReport(id, report, holdings)
      return report
    },
    { fallbackToMockOnError: false }
  )
}
