"use client"

import { useEffect, useMemo, useState } from "react"
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

export function usePortfolioData(portfolioId?: string) {
  const [loading, setLoading] = useState(true)
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null)
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [history, setHistory] = useState<PortfolioPerformancePoint[]>([])
  const [allocation, setAllocation] = useState<AllocationItem[]>([])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getPortfolio(portfolioId),
      getPortfolioSummary(portfolioId),
      getPortfolioHoldings(portfolioId),
      getPortfolioPerformance(portfolioId),
      getPortfolioAllocation(portfolioId),
    ])
      .then(([portfolioData, summaryData, holdingsData, historyData, allocationData]) => {
        if (cancelled) return
        setPortfolio(portfolioData)
        setSummary(summaryData)
        setHoldings(holdingsData)
        setHistory(historyData)
        setAllocation(allocationData)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [portfolioId])

  const riskLevel = useMemo(() => {
    if (!summary) return "Moderate" as RiskLevel
    return riskLevelFromScore(summary.aiRiskScore)
  }, [summary])

  const ready =
    !loading &&
    portfolio !== null &&
    summary !== null &&
    holdings.length > 0 &&
    history.length > 0 &&
    allocation.length > 0

  return {
    loading,
    ready,
    portfolio,
    summary,
    holdings,
    history,
    allocation,
    riskLevel,
  }
}
