"use client"

import DashboardLayout from "@/components/dashboard-layout"
import {
  AllocationChart,
  PortfolioPerformanceChart,
} from "@/components/dashboard"
import {
  AddTransactionDialog,
  GenerateAnalysisDialog,
  PortfolioHeader,
  PortfolioHoldingsTable,
  PortfolioMetricsStrip,
  PortfolioSkeleton,
} from "@/components/portfolio"
import { usePortfolioData } from "@/hooks/use-portfolio-data"

export default function PortfolioPage() {
  const {
    loading,
    ready,
    portfolio,
    summary,
    holdings,
    history,
    allocation,
    riskLevel,
  } = usePortfolioData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {loading && <PortfolioSkeleton />}

        {!loading && portfolio && (
          <PortfolioHeader
            portfolio={portfolio}
            actions={
              ready && summary ? (
                <>
                  <AddTransactionDialog
                    holdings={holdings}
                    portfolioId={summary.portfolioId}
                  />
                  <GenerateAnalysisDialog portfolioId={summary.portfolioId} />
                </>
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

            <PortfolioHoldingsTable holdings={holdings} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
