"use client"

import DashboardLayout from "@/components/dashboard-layout"
import {
  AIAdvisorySection,
  AlertEventsPanel,
  AlertsHeader,
  AlertsSection,
  AlertsSkeleton,
  AlertsStatsStrip,
  CreateAlertModal,
} from "@/components/alerts"
import { useActivePortfolio } from "@/hooks/use-active-portfolio"
import { useAlertsData } from "@/hooks/use-alerts-data"
import { useAIInsightsData } from "@/hooks/use-ai-insights-data"

export default function AlertsPage() {
  const { portfolioId } = useActivePortfolio()
  const {
    loading,
    assets,
    activeAlerts,
    triggeredAlerts,
    disabledAlerts,
    events,
    createAlert,
    toggleAlert,
    deleteAlert,
  } = useAlertsData()
  const { advisories } = useAIInsightsData(portfolioId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {loading && <AlertsSkeleton />}

        {!loading && (
          <>
            <AlertsHeader
              actions={
                <CreateAlertModal
                  assets={assets}
                  onCreate={async (input) => {
                    await createAlert(input)
                  }}
                />
              }
            />

            <AlertsStatsStrip
              activeCount={activeAlerts.length}
              triggeredCount={triggeredAlerts.length}
              disabledCount={disabledAlerts.length}
              eventsCount={events.length + advisories.length}
            />

            <AIAdvisorySection advisories={advisories} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="min-w-0 space-y-8 lg:col-span-2">
                <AlertsSection
                  title="Active alerts"
                  description="Monitoring price targets in real time (simulated)."
                  alerts={activeAlerts}
                  emptyMessage="No active alerts. Create one to watch a market level."
                  onToggle={toggleAlert}
                  onDelete={deleteAlert}
                />

                <AlertsSection
                  title="Triggered alerts"
                  description="Conditions that have already fired."
                  alerts={triggeredAlerts}
                  emptyMessage="No triggered alerts yet."
                  onToggle={toggleAlert}
                  onDelete={deleteAlert}
                />

                {disabledAlerts.length > 0 && (
                  <AlertsSection
                    title="Disabled alerts"
                    description="Paused rules you can re-enable anytime."
                    alerts={disabledAlerts}
                    emptyMessage=""
                    onToggle={toggleAlert}
                    onDelete={deleteAlert}
                  />
                )}
              </div>

              <div className="min-w-0">
                <AlertEventsPanel events={events} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
