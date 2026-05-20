"use client"

import { motion } from "framer-motion"
import { Activity, LineChart } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/mock-data"
import type { PortfolioSummary } from "@/types/api"

type DashboardTerminalHeaderProps = {
  summary: PortfolioSummary
}

export function DashboardTerminalHeader({ summary }: DashboardTerminalHeaderProps) {
  const up = summary.totalProfitLoss >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0A0A]/90 p-4 sm:p-5 md:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />

      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-[#C9A227]" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
              Portfolio terminal
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#00D084]/20 bg-[#00D084]/10 px-2 py-0.5 text-[10px] font-medium text-[#00D084]">
              <Activity className="h-3 w-3" aria-hidden />
              Live
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Portfolio synced with your transactions and live market prices
          </p>
        </div>

        <div className="min-w-0 shrink-0 text-left md:text-right">
          <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">
            Net portfolio value
          </p>
          <p className="font-mono text-xl font-bold tabular-nums text-white sm:text-2xl md:text-3xl">
            {formatCurrency(summary.totalValue)}
          </p>
          <p
            className={`mt-1 font-mono text-sm font-medium tabular-nums ${
              up ? "text-[#00D084]" : "text-[#FF3B30]"
            }`}
          >
            {up ? "+" : ""}
            {formatCurrency(summary.totalProfitLoss)} (
            {formatPercent(summary.totalProfitLossPercent)})
          </p>
        </div>
      </div>
    </motion.div>
  )
}
