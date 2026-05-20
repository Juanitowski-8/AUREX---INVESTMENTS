"use client"

import { motion } from "framer-motion"
import { Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { computeConcentration } from "@/lib/ai/portfolio-exposure"
import type { Holding } from "@/types"

type ConcentrationCardProps = {
  holdings: Holding[]
}

export function ConcentrationCard({ holdings }: ConcentrationCardProps) {
  const { top3, top3Pct, level } = computeConcentration(holdings)

  const barColor =
    level === "high"
      ? "#FF3B30"
      : level === "elevated"
        ? "#FFB800"
        : "#00D084"

  const note =
    level === "high"
      ? "Top-three concentration is elevated. A larger number of smaller positions may reduce single-name risk in educational simulations."
      : level === "elevated"
        ? "Concentration is moderate. Review whether largest weights align with your stated risk tolerance."
        : "Top-three concentration appears balanced relative to common diversification benchmarks."

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#00B4D8]/10 p-2">
            <Layers className="h-5 w-5 text-[#00B4D8]" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              Concentration
            </p>
            <h3 className="text-lg font-semibold text-white">
              Portfolio concentration
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA]">Top 3 holdings</span>
            <span className="font-mono font-semibold tabular-nums" style={{ color: barColor }}>
              {top3Pct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(top3Pct, 100)}%`, backgroundColor: barColor }}
            />
          </div>
        </div>

        <ul className="mb-4 space-y-2">
          {top3.map((holding, index) => (
            <li
              key={holding.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-[#71717A]">
                  {index + 1}
                </span>
                {holding.asset.symbol}
              </span>
              <span className="font-mono tabular-nums text-[#A1A1AA]">
                {holding.allocation.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>

        <p
          className="mt-auto rounded-lg border px-3 py-2 text-xs leading-relaxed"
          style={{
            borderColor: `${barColor}33`,
            backgroundColor: `${barColor}14`,
            color: barColor,
          }}
        >
          {note}
        </p>
      </Card>
    </motion.div>
  )
}
