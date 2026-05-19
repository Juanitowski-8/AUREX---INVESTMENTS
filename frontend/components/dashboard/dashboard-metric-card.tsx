"use client"

import { motion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui/card"

export type MetricTrend = "up" | "down" | "neutral"

type DashboardMetricCardProps = {
  title: string
  value: string
  change?: string
  sublabel?: string
  icon: React.ElementType
  trend?: MetricTrend
  accent?: boolean
  delay?: number
}

export function DashboardMetricCard({
  title,
  value,
  change,
  sublabel,
  icon: Icon,
  trend = "neutral",
  accent = false,
  delay = 0,
}: DashboardMetricCardProps) {
  const isPositive = trend === "up"
  const isNegative = trend === "down"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <Card
        className={`relative overflow-hidden border-white/[0.06] bg-[#0A0A0A]/95 p-5 transition-colors hover:border-white/10 ${
          accent ? "border-[#C9A227]/25" : ""
        }`}
      >
        {accent && (
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#C9A227]/10 blur-2xl" />
        )}
        <div className="relative z-10">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div
              className={`rounded-lg p-2 ${
                accent ? "bg-[#C9A227]/10" : "bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${accent ? "text-[#C9A227]" : "text-[#A1A1AA]"}`}
                aria-hidden
              />
            </div>
            {change && (
              <span
                className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold tabular-nums ${
                  isPositive
                    ? "text-[#00D084]"
                    : isNegative
                      ? "text-[#FF3B30]"
                      : "text-[#A1A1AA]"
                }`}
              >
                {isPositive && <ArrowUpRight className="h-3 w-3" />}
                {isNegative && <ArrowDownRight className="h-3 w-3" />}
                {change}
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#A1A1AA]">
            {title}
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-white">
            {value}
          </p>
          {sublabel && (
            <p className="mt-1 truncate text-xs text-[#71717A]">{sublabel}</p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

