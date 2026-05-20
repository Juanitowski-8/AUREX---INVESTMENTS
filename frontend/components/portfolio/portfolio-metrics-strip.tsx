"use client"

import { motion } from "framer-motion"
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Shield,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/mock-data"
import type { PortfolioSummary } from "@/types/api"
import type { RiskLevel } from "@/types"

type PortfolioMetricsStripProps = {
  summary: PortfolioSummary
  riskLevel: RiskLevel
}

function riskBadgeClass(level: RiskLevel): string {
  if (level === "Low") return "text-[#00D084]"
  if (level === "Moderate") return "text-[#FFB800]"
  return "text-[#FF3B30]"
}

type MetricItem = {
  label: string
  value: string
  sub?: string
  trend?: "up" | "down" | "neutral"
  icon: React.ElementType
  accent?: boolean
  delay: number
}

export function PortfolioMetricsStrip({
  summary,
  riskLevel,
}: PortfolioMetricsStripProps) {
  const plUp = summary.totalProfitLoss >= 0
  const dailyUp = summary.dailyReturn >= 0
  const monthlyUp = summary.monthlyReturn >= 0

  const metrics: MetricItem[] = [
    {
      label: "Total value",
      value: formatCurrency(summary.totalValue),
      sub: formatPercent(summary.totalProfitLossPercent) + " all time",
      trend: plUp ? "up" : "down",
      icon: Wallet,
      accent: true,
      delay: 0,
    },
    {
      label: "Total profit / loss",
      value: formatCurrency(summary.totalProfitLoss),
      sub: formatPercent(summary.totalProfitLossPercent),
      trend: plUp ? "up" : "down",
      icon: plUp ? TrendingUp : TrendingDown,
      delay: 0.05,
    },
    {
      label: "Daily return",
      value: formatPercent(summary.dailyReturn),
      trend: dailyUp ? "up" : "down",
      icon: Calendar,
      delay: 0.1,
    },
    {
      label: "Monthly return",
      value: formatPercent(summary.monthlyReturn),
      trend: monthlyUp ? "up" : "down",
      icon: Calendar,
      delay: 0.15,
    },
    {
      label: "Risk level",
      value: riskLevel,
      sub: `AI score ${summary.aiRiskScore} / 100`,
      trend: "neutral",
      icon: Shield,
      delay: 0.2,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const isUp = metric.trend === "up"
        const isDown = metric.trend === "down"

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: metric.delay }}
          >
            <Card
              className={`relative overflow-hidden border-white/[0.06] bg-[#0A0A0A]/95 p-4 md:p-5 ${
                metric.accent ? "border-[#C9A227]/25" : ""
              }`}
            >
              {metric.accent && (
                <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#C9A227]/10 blur-2xl" />
              )}
              <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`rounded-lg p-2 ${
                      metric.accent ? "bg-[#C9A227]/10" : "bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        metric.accent ? "text-[#C9A227]" : "text-[#A1A1AA]"
                      }`}
                      aria-hidden
                    />
                  </div>
                  {metric.trend && metric.trend !== "neutral" && (
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold tabular-nums ${
                        isUp
                          ? "text-[#00D084]"
                          : isDown
                            ? "text-[#FF3B30]"
                            : "text-[#A1A1AA]"
                      }`}
                    >
                      {isUp && <ArrowUpRight className="h-3 w-3" />}
                      {isDown && <ArrowDownRight className="h-3 w-3" />}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#A1A1AA]">
                  {metric.label}
                </p>
                <p
                  className={`mt-1 font-mono text-xl font-bold tabular-nums ${
                    metric.label === "Risk level"
                      ? riskBadgeClass(riskLevel)
                      : "text-white"
                  }`}
                >
                  {metric.value}
                </p>
                {metric.sub && (
                  <p
                    className={`mt-1 text-xs tabular-nums ${
                      metric.label === "Risk level"
                        ? "text-[#71717A]"
                        : isUp
                          ? "text-[#00D084]/90"
                          : isDown
                            ? "text-[#FF3B30]/90"
                            : "text-[#71717A]"
                    }`}
                  >
                    {metric.sub}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
