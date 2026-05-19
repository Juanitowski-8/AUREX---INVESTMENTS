"use client"

import DashboardLayout from "@/components/dashboard-layout"
import {
  AllocationChart,
  PortfolioPerformanceChart,
} from "@/components/dashboard"
import {
  AddTransactionDialog,
  GenerateAnalysisDialog,
  PortfolioEmptyState,
  PortfolioHeader,
  PortfolioHoldingsTable,
  PortfolioMetricsStrip,
  PortfolioSelector,
  PortfolioSkeleton,
} from "@/components/portfolio"
import { Card } from "@/components/ui/card"
import { useActivePortfolio } from "@/hooks/use-active-portfolio"
import { usePortfolioData } from "@/hooks/use-portfolio-data"

export default function PortfolioPage() {
  const {
    portfolioId,
    portfolios,
    loading: portfoliosLoading,
    noPortfolio,
    error: portfoliosError,
    refresh: refreshPortfolios,
    setActivePortfolio,
  } = useActivePortfolio()

  const {
    loading,
    ready,
    portfolio,
    summary,
    holdings,
    history,
    allocation,
    riskLevel,
    refresh,
    hasHoldings,
    error: portfolioDataError,
  } = usePortfolioData(portfolioId)

  const handleRefresh = async () => {
    await refreshPortfolios()
    await refresh()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {(portfoliosLoading || loading) && !noPortfolio && <PortfolioSkeleton />}

        {!portfoliosLoading && noPortfolio && (
          <PortfolioEmptyState onCreated={handleRefresh} />
        )}

        {(portfoliosError || portfolioDataError) && !noPortfolio && (
          <p className="rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-4 py-3 text-sm text-[#FF3B30]">
            {portfoliosError ?? portfolioDataError}
          </p>
        )}

        {!portfoliosLoading && !noPortfolio && portfolio && (
          <PortfolioHeader
            portfolio={portfolio}
            actions={
              summary ? (
                <div className="flex flex-wrap items-center gap-2">
                  <PortfolioSelector
                    portfolios={portfolios}
                    value={portfolioId!}
                    onChange={setActivePortfolio}
                  />
                  <AddTransactionDialog
                    portfolioId={summary.portfolioId}
                    onSuccess={refresh}
                  />
                  <GenerateAnalysisDialog
                    portfolioId={summary.portfolioId}
                    onGenerated={refresh}
                  />
                </div>
              ) : null
            }
          />
        )}

        {!loading && ready && summary && (
          <>
            <PortfolioMetricsStrip summary={summary} riskLevel={riskLevel} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="aurex-chart-col">
                <PortfolioPerformanceChart history={history} />
              </div>
              <div className="min-w-0">
                <AllocationChart allocation={allocation} />
              </div>
            </div>

            {hasHoldings ? (
              <PortfolioHoldingsTable holdings={holdings} />
            ) : (
              <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-8 text-center">
                <p className="text-lg font-semibold text-white">No holdings yet</p>
                <p className="mt-2 text-sm text-[#A1A1AA]">
                  Add a simulated buy transaction to build your portfolio.
                </p>
                <div className="mt-4 flex justify-center">
                  <AddTransactionDialog
                    portfolioId={summary.portfolioId}
                    onSuccess={refresh}
                  />
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
