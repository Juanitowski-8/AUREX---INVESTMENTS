"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Bell, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent } from "@/lib/mock-data"
import type { DashboardActivityItem } from "@/hooks/use-dashboard-data"
import { alertRuleTypeLabel } from "@/types/finance"

type RecentActivityPanelProps = {
  items: DashboardActivityItem[]
}

function formatActivityTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function RecentActivityPanel({ items }: RecentActivityPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
    >
      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#C9A227]/10 p-2">
              <Bell className="h-4 w-4 text-[#C9A227]" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
                Activity
              </p>
              <h3 className="text-lg font-semibold text-white">Recent alerts</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#C9A227] hover:bg-[#C9A227]/10 hover:text-[#E8C547]"
            asChild
          >
            <Link href="/alerts">View all</Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#71717A]">
            No recent activity. Alerts will appear here when triggered.
          </p>
        ) : (
          <ul className="space-y-0 divide-y divide-white/[0.04]">
            {items.map((item) => {
              if (item.kind === "event") {
                const { event } = item
                return (
                  <li
                    key={`event-${event.id}`}
                    className="flex gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF3B30]/10">
                      <Bell className="h-3.5 w-3.5 text-[#FF3B30]" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {event.asset.symbol} alert triggered
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[#A1A1AA]">
                        {event.message ??
                          `Price at trigger: ${formatCurrency(event.priceAtTrigger)}`}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-[#71717A]">
                        <Clock className="h-3 w-3" aria-hidden />
                        {formatActivityTime(event.triggeredAt)}
                      </p>
                    </div>
                  </li>
                )
              }

              const { rule } = item
              const triggered = rule.status === "Triggered"
              return (
                <li
                  key={`rule-${rule.id}-${item.at}`}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      triggered ? "bg-[#FF3B30]/10" : "bg-[#C9A227]/10"
                    }`}
                  >
                    <Bell
                      className={`h-3.5 w-3.5 ${
                        triggered ? "text-[#FF3B30]" : "text-[#C9A227]"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {rule.asset.symbol} · {alertRuleTypeLabel(rule.type)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#A1A1AA]">
                      Target{" "}
                      {rule.type === "PERCENT_CHANGE"
                        ? formatPercent(rule.targetValue)
                        : formatCurrency(rule.targetValue)}{" "}
                      ·{" "}
                      <span
                        className={
                          rule.status === "Triggered"
                            ? "text-[#FF3B30]"
                            : rule.status === "Active"
                              ? "text-[#00D084]"
                              : "text-[#71717A]"
                        }
                      >
                        {rule.status}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-[#71717A]">
                      <Clock className="h-3 w-3" aria-hidden />
                      {formatActivityTime(item.at)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </motion.div>
  )
}
