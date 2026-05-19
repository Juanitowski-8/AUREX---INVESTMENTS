"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { aiReportToInsight } from "@/lib/ai/report-to-insight"
import { subscribePortfolioUpdated } from "@/lib/portfolio-events"
import { getAIInsights, getAIReports } from "@/services/ai.service"
import { getAlertEvents, getAlerts } from "@/services/alerts.service"
import {
  getPortfolioAllocation,
  getPortfolioHoldings,
  getPortfolioPerformance,
  getPortfolioSummary,
} from "@/services/portfolio.service"
import type {
  AIInsight,
  AlertEvent,
  AlertRule,
  AllocationItem,
  Holding,
  PortfolioPerformancePoint,
  RiskLevel,
} from "@/types"
import type { PortfolioSummary } from "@/types/api"

export type DashboardActivityItem =
  | { kind: "event"; at: string; event: AlertEvent }
  | { kind: "rule"; at: string; rule: AlertRule }

function buildRecentActivity(
  events: AlertEvent[],
  rules: AlertRule[]
): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [
    ...events.map((event) => ({
      kind: "event" as const,
      at: event.triggeredAt,
      event,
    })),
    ...rules
      .filter((r) => r.status === "Triggered" && r.triggeredAt)
      .map((rule) => ({
        kind: "rule" as const,
        at: rule.triggeredAt!,
        rule,
      })),
    ...rules
      .filter((r) => r.status === "Active")
      .slice(0, 3)
      .map((rule) => ({
        kind: "rule" as const,
        at: `${rule.createdAt}T12:00:00Z`,
        rule,
      })),
  ]

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6)
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score < 40) return "Low"
  if (score < 70) return "Moderate"
  return "High"
}

export function useDashboardData(portfolioId: string | null) {
  const [loading, setLoading] = useState(Boolean(portfolioId))
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [history, setHistory] = useState<PortfolioPerformancePoint[]>([])
  const [allocation, setAllocation] = useState<AllocationItem[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [alerts, setAlerts] = useState<AlertRule[]>([])
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!portfolioId) {
      setSummary(null)
      setHoldings([])
      setHistory([])
      setAllocation([])
      setInsights([])
      setAlerts([])
      setAlertEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [
        summaryData,
        holdingsData,
        historyData,
        allocationData,
        insightsData,
        reportsData,
        alertsData,
        eventsData,
      ] = await Promise.all([
        getPortfolioSummary(portfolioId, { reload: true }),
        getPortfolioHoldings(portfolioId, { reload: true }),
        getPortfolioPerformance(portfolioId),
        getPortfolioAllocation(portfolioId),
        getAIInsights(),
        getAIReports(portfolioId),
        getAlerts(),
        getAlertEvents(),
      ])
      setSummary(summaryData)
      setHoldings(holdingsData)
      setHistory(historyData)
      setAllocation(allocationData)
      const latestReport = reportsData[0]
      setInsights(
        latestReport
          ? [aiReportToInsight(latestReport)]
          : insightsData
      )
      setAlerts(alertsData)
      setAlertEvents(eventsData)
    } catch (err) {
      setSummary(null)
      setError(
        err instanceof Error ? err.message : "Could not load dashboard data"
      )
    } finally {
      setLoading(false)
    }
  }, [portfolioId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!portfolioId) return
    return subscribePortfolioUpdated((detail) => {
      if (detail.portfolioId === portfolioId) void refresh()
    })
  }, [portfolioId, refresh])

  const bestPerformer = useMemo(() => {
    if (holdings.length === 0) return null
    return holdings.reduce((a, b) =>
      a.profitLossPercent > b.profitLossPercent ? a : b
    )
  }, [holdings])

  const worstPerformer = useMemo(() => {
    if (holdings.length === 0) return null
    return holdings.reduce((a, b) =>
      a.profitLossPercent < b.profitLossPercent ? a : b
    )
  }, [holdings])

  const primaryInsight = insights[0] ?? null

  const riskLevel = useMemo(() => {
    if (primaryInsight) return primaryInsight.riskLevel
    if (summary) return riskLevelFromScore(summary.aiRiskScore)
    return "Moderate" as RiskLevel
  }, [primaryInsight, summary])

  const recentActivity = useMemo(
    () => buildRecentActivity(alertEvents, alerts),
    [alertEvents, alerts]
  )

  const ready = !loading && summary !== null

  return {
    loading,
    error,
    ready,
    summary,
    holdings,
    history,
    allocation,
    insights,
    alerts,
    alertEvents,
    primaryInsight,
    bestPerformer,
    worstPerformer,
    riskLevel,
    recentActivity,
    refresh,
    hasHoldings: holdings.length > 0,
  }
}
