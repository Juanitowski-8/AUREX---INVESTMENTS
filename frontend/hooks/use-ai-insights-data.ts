"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  buildPortfolioAnalysisObservations,
  computeRiskScore,
  scoreToRiskLevel,
} from "@/lib/ai/build-portfolio-analysis"
import { aiReportToInsight } from "@/lib/ai/report-to-insight"
import { subscribePortfolioUpdated } from "@/lib/portfolio-events"
import {
  generatePortfolioAnalysis,
  getAIInsights,
  getAIReports,
} from "@/services/ai.service"
import { getPortfolioHoldings } from "@/services/portfolio.service"
import type { AIInsight, AIReport, Holding } from "@/types"

export function useAIInsightsData(portfolioId: string | null) {
  const [loading, setLoading] = useState(Boolean(portfolioId))
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [reports, setReports] = useState<AIReport[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])

  const load = useCallback(async () => {
    if (!portfolioId) {
      setInsights([])
      setReports([])
      setHoldings([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [insightsData, reportsData, holdingsData] = await Promise.all([
        getAIInsights(),
        getAIReports(portfolioId),
        getPortfolioHoldings(portfolioId, { reload: true }),
      ])
      setInsights(insightsData)
      setReports(reportsData)
      setHoldings(holdingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load AI insights")
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [portfolioId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!portfolioId) return
    return subscribePortfolioUpdated((detail) => {
      if (detail.portfolioId === portfolioId) void load()
    })
  }, [portfolioId, load])

  const latestReport = reports[0] ?? null
  const primaryInsight = insights[0] ?? null

  const summaryText = useMemo(() => {
    if (latestReport) return latestReport.summary
    if (holdings.length > 0) {
      return "Your holdings are loaded. Click “Generate new analysis” to build a snapshot from your current positions."
    }
    return primaryInsight?.content ?? ""
  }, [latestReport, holdings.length, primaryInsight])

  const derivedRiskScore = useMemo(
    () => (holdings.length > 0 ? computeRiskScore(holdings) : 0),
    [holdings]
  )

  const riskScore =
    latestReport?.riskScore ??
    (holdings.length > 0 ? derivedRiskScore : primaryInsight?.riskScore ?? 0)
  const riskLevel =
    latestReport?.riskLevel ??
    (holdings.length > 0
      ? scoreToRiskLevel(derivedRiskScore)
      : primaryInsight?.riskLevel ?? "Moderate")

  const observations = useMemo(() => {
    if (latestReport?.observations.length) return latestReport.observations
    if (holdings.length > 0) return buildPortfolioAnalysisObservations(holdings)
    return primaryInsight?.recommendations ?? []
  }, [latestReport, holdings, primaryInsight])

  const historicalReports = useMemo(
    () => reports.slice(latestReport ? 1 : 0),
    [reports, latestReport]
  )

  const generateAnalysis = useCallback(async () => {
    if (!portfolioId) {
      toast.error("Create a portfolio first.")
      return null
    }
    if (holdings.length === 0) {
      toast.error("Add at least one transaction before generating analysis.")
      return null
    }

    setGenerating(true)
    setError(null)
    try {
      const report = await generatePortfolioAnalysis(portfolioId)
      setReports((prev) => [
        report,
        ...prev.filter((r) => r.id !== report.id),
      ])
      setInsights([aiReportToInsight(report)])
      await load()
      toast.success("Analysis generated", {
        description: `Risk score ${report.riskScore}/100 · ${report.riskLevel}`,
      })
      return report
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not generate analysis"
      setError(message)
      toast.error(message)
      return null
    } finally {
      setGenerating(false)
    }
  }, [portfolioId, holdings.length, load])

  const hasHoldings = holdings.length > 0
  const hasReport = latestReport != null
  const showContent = !loading && hasHoldings

  return {
    loading,
    generating,
    error,
    hasHoldings,
    hasReport,
    showContent,
    holdings,
    latestReport,
    primaryInsight,
    summaryText,
    riskScore,
    riskLevel,
    observations,
    historicalReports,
    generateAnalysis,
    refresh: load,
  }
}
