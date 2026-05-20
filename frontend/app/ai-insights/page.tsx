"use client"

import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import {
  AIAdvisoryAlertsPanel,
  AIInsightsDisclaimer,
  AIInsightsHeader,
  AIInsightsSkeleton,
  ConcentrationCard,
  HistoricalReportsList,
  MarketExposureCard,
  ObservationsPanel,
  PortfolioSummaryReport,
} from "@/components/ai-insights"
import { PortfolioEmptyState } from "@/components/portfolio"
import { Button } from "@/components/ui/button"
import { useActivePortfolio } from "@/hooks/use-active-portfolio"
import { useAIInsightsData } from "@/hooks/use-ai-insights-data"

export default function AIInsightsPage() {
  const {
    portfolioId,
    loading: portfoliosLoading,
    noPortfolio,
    refresh: refreshPortfolios,
  } = useActivePortfolio()

  const {
    loading,
    generating,
    error,
    showContent,
    hasHoldings,
    holdings,
    latestReport,
    primaryInsight,
    summaryText,
    riskScore,
    riskLevel,
    observations,
    historicalReports,
    advisories,
    generateAnalysis,
  } = useAIInsightsData(portfolioId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {(portfoliosLoading || loading) && !noPortfolio && <AIInsightsSkeleton />}

        {!portfoliosLoading && noPortfolio && (
          <PortfolioEmptyState onCreated={refreshPortfolios} />
        )}

        {!portfoliosLoading && !noPortfolio && portfolioId && !loading && (
          <>
            <AIInsightsHeader
              generating={generating}
              disabled={!hasHoldings}
              onGenerate={() => void generateAnalysis()}
            />

            <AIInsightsDisclaimer compact />

            {!hasHoldings && (
              <div className="rounded-xl border border-[#C9A227]/20 bg-[#C9A227]/5 p-6 text-center">
                <p className="text-sm text-[#A1A1AA]">
                  No holdings in this portfolio yet. Add a buy transaction first,
                  then generate analysis from your real positions.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
                >
                  <Link href="/portfolio">Go to Portfolio</Link>
                </Button>
              </div>
            )}

            {error && (
              <p className="text-sm text-[#FF3B30]" role="alert">
                {error}
              </p>
            )}

            {showContent && (
              <>
                <PortfolioSummaryReport
                  title={
                    latestReport?.title ??
                    primaryInsight?.title ??
                    "Portfolio intelligence"
                  }
                  summary={summaryText}
                  riskScore={riskScore}
                  riskLevel={riskLevel}
                  report={latestReport}
                  generatedAt={latestReport?.createdAt}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="min-w-0">
                    <ConcentrationCard holdings={holdings} />
                  </div>
                  <div className="min-w-0">
                    <MarketExposureCard holdings={holdings} />
                  </div>
                </div>

                <ObservationsPanel observations={observations} />

                <AIAdvisoryAlertsPanel advisories={advisories} />

                <HistoricalReportsList reports={historicalReports} />

                <AIInsightsDisclaimer />
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
