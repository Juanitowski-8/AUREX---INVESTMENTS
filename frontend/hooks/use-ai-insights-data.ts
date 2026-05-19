"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  generatePortfolioAnalysis,
  getAIInsights,
  getAIReports,
} from "@/services/ai.service"
import { getPortfolioHoldings } from "@/services/portfolio.service"
import { mockPortfolio } from "@/lib/mock-data"
import type { AIInsight, AIReport, Holding } from "@/types"

export function useAIInsightsData(portfolioId: string = mockPortfolio.id) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [reports, setReports] = useState<AIReport[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])

  const load = useCallback(async () => {
    const [insightsData, reportsData, holdingsData] = await Promise.all([
      getAIInsights(),
      getAIReports(),
      getPortfolioHoldings(portfolioId),
    ])
    setInsights(insightsData)
    setReports(reportsData)
    setHoldings(holdingsData)
    setLoading(false)
  }, [portfolioId])

  useEffect(() => {
    let cancelled = false
    load().catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  const primaryInsight = insights[0] ?? null
  const latestReport = reports[0] ?? null

  const summaryText = useMemo(() => {
    if (latestReport) return latestReport.summary
    return primaryInsight?.content ?? ""
  }, [latestReport, primaryInsight])

  const riskScore = latestReport?.riskScore ?? primaryInsight?.riskScore ?? 0
  const riskLevel = latestReport?.riskLevel ?? primaryInsight?.riskLevel ?? "Moderate"

  const observations = useMemo(() => {
    if (latestReport?.observations.length) return latestReport.observations
    return primaryInsight?.recommendations ?? []
  }, [latestReport, primaryInsight])

  const historicalReports = useMemo(
    () => reports.slice(latestReport ? 1 : 0),
    [reports, latestReport]
  )

  const generateAnalysis = useCallback(async () => {
    setGenerating(true)
    try {
      const report = await generatePortfolioAnalysis(portfolioId)
      setReports((prev) => [
        report,
        ...prev.filter((r) => r.id !== report.id),
      ])
      return report
    } finally {
      setGenerating(false)
    }
  }, [portfolioId])

  const ready = !loading && holdings.length > 0 && (primaryInsight || latestReport)

  return {
    loading,
    generating,
    ready,
    insights,
    reports,
    holdings,
    primaryInsight,
    latestReport,
    summaryText,
    riskScore,
    riskLevel,
    observations,
    historicalReports,
    generateAnalysis,
    refresh: load,
  }
}
