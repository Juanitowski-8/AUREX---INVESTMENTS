"use client"

import DashboardLayout from "@/components/dashboard-layout"
import {
  AIInsightsDisclaimer,
  AIInsightsHeader,
  AIInsightsSkeleton,
  ConcentrationCard,
  HistoricalReportsList,
  MarketExposureCard,
  ObservationsPanel,
  PortfolioSummaryReport,
} from "@/components/ai-insights"
import { useAIInsightsData } from "@/hooks/use-ai-insights-data"

export default function AIInsightsPage() {
  const {
    loading,
    generating,
    ready,
    holdings,
    latestReport,
    primaryInsight,
    summaryText,
    riskScore,
    riskLevel,
    observations,
    historicalReports,
    generateAnalysis,
  } = useAIInsightsData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {loading && <AIInsightsSkeleton />}

        {!loading && (
          <>
            <AIInsightsHeader
              generating={generating}
              onGenerate={() => void generateAnalysis()}
            />

            <AIInsightsDisclaimer compact />

            {ready && (
              <>
                <PortfolioSummaryReport
                  title={primaryInsight?.title ?? "Portfolio intelligence"}
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
