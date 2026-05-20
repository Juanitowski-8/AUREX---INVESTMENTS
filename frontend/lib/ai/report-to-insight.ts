import type { AIInsight, AIReport } from '@/types'

/** Adapta un reporte IA del API/mock al formato de tarjeta del dashboard. */
export function aiReportToInsight(report: AIReport): AIInsight {
  return {
    id: report.id,
    title: report.title,
    content: report.summary,
    riskScore: report.riskScore,
    riskLevel: report.riskLevel,
    recommendations: report.observations,
    createdAt: report.createdAt,
  }
}
