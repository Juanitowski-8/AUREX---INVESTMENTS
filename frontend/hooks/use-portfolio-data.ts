"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { subscribePortfolioUpdated } from "@/lib/portfolio-events"
import {
  getPortfolio,
  getPortfolioAllocation,
  getPortfolioHoldings,
  getPortfolioPerformance,
  getPortfolioSummary,
} from "@/services/portfolio.service"
import type {
  AllocationItem,
  Holding,
  PortfolioPerformancePoint,
  RiskLevel,
} from "@/types"
import type { PortfolioDetail, PortfolioSummary } from "@/types/api"

function riskLevelFromScore(score: number): RiskLevel {
  if (score < 40) return "Low"
  if (score < 70) return "Moderate"
  return "High"
}

export function usePortfolioData(portfolioId: string | null) {
  const [loading, setLoading] = useState(Boolean(portfolioId))
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null)
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [history, setHistory] = useState<PortfolioPerformancePoint[]>([])
  const [allocation, setAllocation] = useState<AllocationItem[]>([])

  const refresh = useCallback(async () => {
    if (!portfolioId) {
      setPortfolio(null)
      setSummary(null)
      setHoldings([])
      setHistory([])
      setAllocation([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [
        portfolioData,
        summaryData,
        holdingsData,
        historyData,
        allocationData,
      ] = await Promise.all([
        getPortfolio(portfolioId),
        getPortfolioSummary(portfolioId, { reload: true }),
        getPortfolioHoldings(portfolioId, { reload: true }),
        getPortfolioPerformance(portfolioId),
        getPortfolioAllocation(portfolioId),
      ])
      setPortfolio(portfolioData)
      setSummary(summaryData)
      setHoldings(holdingsData)
      setHistory(historyData)
      setAllocation(allocationData)
    } catch {
      setPortfolio(null)
      setSummary(null)
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

  const riskLevel = useMemo(() => {
    if (!summary) return "Moderate" as RiskLevel
    return riskLevelFromScore(summary.aiRiskScore)
  }, [summary])

  const ready = !loading && portfolio !== null && summary !== null

  return {
    loading,
    ready,
    portfolio,
    summary,
    holdings,
    history,
    allocation,
    riskLevel,
    refresh,
    hasHoldings: holdings.length > 0,
  }
}
