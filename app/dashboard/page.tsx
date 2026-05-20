"use client"

import {
  BarChart3,
  Brain,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  AIInsightCard,
  AllocationChart,
  DashboardMetricCard,
  DashboardSkeleton,
  DashboardTerminalHeader,
  HoldingsTable,
  PortfolioPerformanceChart,
  RecentActivityPanel,
} from "@/components/dashboard"
import { AddTransactionDialog } from "@/components/portfolio"
import type { MetricTrend } from "@/components/dashboard"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { formatCurrency, formatPercent } from "@/lib/mock-data"

function trendFromValue(value: number): MetricTrend {
  if (value > 0) return "up"
  if (value < 0) return "down"
  return "neutral"
}

export default function DashboardPage() {
  const {
    loading,
    ready,
    summary,
    holdings,
    history,
    allocation,
    primaryInsight,
    bestPerformer,
    worstPerformer,
    riskLevel,
    recentActivity,
  } = useDashboardData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {loading && <DashboardSkeleton />}

        {!loading && summary && (
          <DashboardTerminalHeader
            summary={summary}
            actions={
              holdings.length > 0 ? (
                <AddTransactionDialog
                  holdings={holdings}
                  portfolioId={summary.portfolioId}
                />
              ) : null
            }
          />
        )}

        {!loading && ready && summary && bestPerformer && worstPerformer && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <DashboardMetricCard
                title="Total Portfolio Value"
                value={formatCurrency(summary.totalValue)}
                change={formatPercent(summary.totalProfitLossPercent)}
                icon={Wallet}
                trend={trendFromValue(summary.totalProfitLossPercent)}
                accent
                delay={0}
              />
              <DashboardMetricCard
                title="Total Profit / Loss"
                value={formatCurrency(summary.totalProfitLoss)}
                change={formatPercent(summary.totalProfitLossPercent)}
                icon={summary.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
                trend={trendFromValue(summary.totalProfitLoss)}
                delay={0.05}
              />
              <DashboardMetricCard
                title="Monthly Return"
                value={formatPercent(summary.monthlyReturn)}
                change={formatPercent(summary.monthlyReturn)}
                icon={BarChart3}
                trend={trendFromValue(summary.monthlyReturn)}
                delay={0.1}
              />
              <DashboardMetricCard
                title="AI Risk Score"
                value={`${summary.aiRiskScore} / 100`}
                sublabel={riskLevel}
                icon={Brain}
                trend="neutral"
                accent
                delay={0.15}
              />
              <DashboardMetricCard
                title="Best Performing Asset"
                value={bestPerformer.asset.symbol}
                sublabel={bestPerformer.asset.name}
                change={formatPercent(bestPerformer.profitLossPercent)}
                icon={TrendingUp}
                trend="up"
                delay={0.2}
              />
              <DashboardMetricCard
                title="Worst Performing Asset"
                value={worstPerformer.asset.symbol}
                sublabel={worstPerformer.asset.name}
                change={formatPercent(worstPerformer.profitLossPercent)}
                icon={TrendingDown}
                trend="down"
                delay={0.25}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="aurex-chart-col">
                <PortfolioPerformanceChart history={history} />
              </div>
              <div className="min-w-0">
                <AllocationChart allocation={allocation} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="aurex-chart-col">
                <HoldingsTable holdings={holdings} />
              </div>
              {primaryInsight && (
                <div className="min-w-0">
                  <AIInsightCard insight={primaryInsight} />
                </div>
              )}
            </div>

            <RecentActivityPanel items={recentActivity} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
