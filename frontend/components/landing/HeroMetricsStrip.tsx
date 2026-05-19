"use client"

import { motion } from "framer-motion"
import type { PortfolioSummary } from "@/types/api"
import { formatCompact, formatPercent } from "@/lib/mock-data"

type HeroMetricsStripProps = {
  summary: PortfolioSummary
  assetCount: number
  exposurePercent: number
  winRate: number
}

export function HeroMetricsStrip({
  summary,
  assetCount,
  exposurePercent,
  winRate,
}: HeroMetricsStripProps) {
  const metrics = [
    {
      label: "Simulated value",
      value: formatCompact(summary.totalValue),
    },
    {
      label: "Monthly return",
      value: formatPercent(summary.monthlyReturn),
      positive: summary.monthlyReturn >= 0,
    },
    {
      label: "AI risk score",
      value: `${summary.aiRiskScore}/100`,
    },
    {
      label: "Assets tracked",
      value: String(assetCount),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-[#0A0A0A]/80 p-4 backdrop-blur-sm sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="text-center sm:text-left">
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">
              {m.label}
            </p>
            <p
              className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${
                m.positive === true
                  ? "text-[#00D084]"
                  : m.positive === false
                    ? "text-[#FF3B30]"
                    : "text-white"
              }`}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#71717A]">
        Simulated data · {exposurePercent}% market exposure · {winRate.toFixed(0)}% positions in profit
      </p>
    </motion.div>
  )
}
