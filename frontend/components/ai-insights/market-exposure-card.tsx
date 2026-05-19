"use client"

import { motion } from "framer-motion"
import { Globe2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { computeMarketExposure } from "@/lib/ai/portfolio-exposure"
import { getAssetTypeColor } from "@/types/finance"
import type { Holding } from "@/types"

type MarketExposureCardProps = {
  holdings: Holding[]
}

export function MarketExposureCard({ holdings }: MarketExposureCardProps) {
  const exposure = computeMarketExposure(holdings)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#C9A227]/10 p-2">
            <Globe2 className="h-5 w-5 text-[#C9A227]" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              Exposure
            </p>
            <h3 className="text-lg font-semibold text-white">Market exposure</h3>
          </div>
        </div>

        <ul className="space-y-4">
          {exposure.map((slice) => {
            const color = getAssetTypeColor(slice.type)
            return (
              <li key={slice.type}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-white">{slice.label}</span>
                  <span className="font-mono text-xs tabular-nums text-[#71717A]">
                    {slice.holdingCount} position{slice.holdingCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(slice.allocation, 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-sm font-medium tabular-nums text-white">
                    {slice.allocation.toFixed(1)}%
                  </span>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-[#71717A]">
          Exposure by asset class describes how simulated capital is distributed
          across digital assets, equities, and funds — not a recommendation to
          change allocation.
        </p>
      </Card>
    </motion.div>
  )
}
