"use client"

import { motion } from "framer-motion"
import {
  Clock,
  Trash2,
  TrendingDown,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/mock-data"
import { alertRuleTypeLabel, getAssetTypeBadgeClass } from "@/types/finance"
import type { AlertRule } from "@/types"
import { AlertStatusBadge } from "./alert-status-badge"

type AlertRuleCardProps = {
  alert: AlertRule
  index?: number
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function formatTimestamp(iso?: string): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function lastExecutionLabel(alert: AlertRule): string {
  if (alert.status === "Triggered" && alert.triggeredAt) {
    return `Triggered ${formatTimestamp(alert.triggeredAt)}`
  }
  if (alert.status === "Active") {
    return `Watching since ${formatTimestamp(alert.createdAt)}`
  }
  return `Created ${formatTimestamp(alert.createdAt)}`
}

export function AlertRuleCard({
  alert,
  index = 0,
  onToggle,
  onDelete,
}: AlertRuleCardProps) {
  const isActive = alert.status === "Active"
  const isDisabled = alert.status === "Disabled"
  const isAbove = alert.type === "PRICE_ABOVE"
  const isBelow = alert.type === "PRICE_BELOW"

  const targetDisplay =
    alert.type === "PERCENT_CHANGE"
      ? `${alert.targetValue}%`
      : formatCurrency(alert.targetValue)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Card
        className={`border-white/[0.06] bg-[#0A0A0A]/95 p-4 transition-colors hover:border-white/10 md:p-5 ${
          isDisabled ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getAssetTypeBadgeClass(alert.asset.type)}`}
            >
              {alert.asset.symbol.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">
                  {alert.asset.symbol}
                </span>
                <span className="truncate text-sm text-[#71717A]">
                  {alert.asset.name}
                </span>
                <AlertStatusBadge status={alert.status} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {isAbove && (
                  <TrendingUp
                    className="h-4 w-4 text-[#00D084]"
                    aria-hidden
                  />
                )}
                {isBelow && (
                  <TrendingDown
                    className="h-4 w-4 text-[#FF3B30]"
                    aria-hidden
                  />
                )}
                <span className="text-[#A1A1AA]">
                  {alert.type === "PRICE_ABOVE" || alert.type === "PRICE_BELOW"
                    ? isAbove
                      ? "Above"
                      : "Below"
                    : alertRuleTypeLabel(alert.type)}
                </span>
                <span className="font-mono font-semibold tabular-nums text-white">
                  {targetDisplay}
                </span>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-[#71717A]">
                <Clock className="h-3 w-3 shrink-0" aria-hidden />
                {lastExecutionLabel(alert)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(alert.id)}
              disabled={alert.status === "Triggered"}
              title={
                alert.status === "Triggered"
                  ? "Triggered alerts cannot be toggled"
                  : isActive
                    ? "Disable alert"
                    : "Enable alert"
              }
              className="text-[#A1A1AA] hover:text-white"
            >
              {isActive ? (
                <ToggleRight className="h-5 w-5 text-[#00D084]" aria-hidden />
              ) : (
                <ToggleLeft className="h-5 w-5" aria-hidden />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(alert.id)}
              className="text-[#A1A1AA] hover:text-[#FF3B30]"
              title="Delete alert"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
