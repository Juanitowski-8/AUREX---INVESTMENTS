"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePortfolioUpdatedListener } from "@/hooks/use-portfolio-updated-listener"
import { getAIInsights } from "@/services/ai.service"
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

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [history, setHistory] = useState<PortfolioPerformancePoint[]>([])
  const [allocation, setAllocation] = useState<AllocationItem[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [alerts, setAlerts] = useState<AlertRule[]>([])
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>([])

  const load = useCallback(async (opts?: { initial?: boolean }) => {
    const initial = opts?.initial ?? false
    if (initial) setLoading(true)
    try {
      const [
        summaryData,
        holdingsData,
        historyData,
        allocationData,
        insightsData,
        alertsData,
        eventsData,
      ] = await Promise.all([
        getPortfolioSummary(),
        getPortfolioHoldings(),
        getPortfolioPerformance(),
        getPortfolioAllocation(),
        getAIInsights(),
        getAlerts(),
        getAlertEvents(),
      ])
      setSummary(summaryData)
      setHoldings(holdingsData)
      setHistory(historyData)
      setAllocation(allocationData)
      setInsights(insightsData)
      setAlerts(alertsData)
      setAlertEvents(eventsData)
    } catch {
      // Silenciar: vistas muestran vacío — conservar comportamiento anterior
    } finally {
      if (initial) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await load({ initial: true })
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  usePortfolioUpdatedListener(null, () => {
    load({ initial: false })
  })

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

  const ready =
    !loading &&
    summary !== null &&
    holdings.length > 0 &&
    history.length > 0 &&
    allocation.length > 0

  return {
    loading,
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
  }
}
