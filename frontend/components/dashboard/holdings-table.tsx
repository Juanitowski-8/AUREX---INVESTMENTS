"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent } from "@/lib/mock-data"
import { formatQuantity } from "@/lib/number-parse"
import {
  formatHoldingMarkPrice,
  formatHoldingPnL,
} from "@/lib/portfolio/holding-display"
import { getAssetTypeBadgeClass } from "@/types/finance"
import type { Holding } from "@/types"

type HoldingsTableProps = {
  holdings: Holding[]
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
    >
      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              Holdings
            </p>
            <h3 className="text-lg font-semibold text-white">Top holdings</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#C9A227] hover:bg-[#C9A227]/10 hover:text-[#E8C547]"
            asChild
          >
            <Link href="/portfolio">View all</Link>
          </Button>
        </div>
        <div className="aurex-table-scroll">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-wide text-[#71717A]">
                <th className="pb-3 pr-4">Asset</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Value</th>
                <th className="pb-3 text-right">P/L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.slice(0, 5).map((holding) => {
                const { money: pnlMoney, pct: pnlPct } = formatHoldingPnL(holding)
                const hasLive = pnlMoney !== "—"
                const up = holding.profitLoss >= 0
                return (
                  <tr
                    key={holding.id}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${getAssetTypeBadgeClass(holding.asset.type)}`}
                        >
                          {holding.asset.symbol.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {holding.asset.name}
                          </p>
                          <p className="text-xs text-[#71717A]">
                            {holding.asset.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-sm tabular-nums text-white">
                      {formatHoldingMarkPrice(holding)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="font-mono text-sm tabular-nums text-white">
                        {formatCurrency(holding.currentValue)}
                      </p>
                      <p className="text-xs text-[#71717A]">
                        {formatQuantity(holding.quantity)} {holding.asset.symbol}
                      </p>
                    </td>
                    <td className="py-3.5 text-right">
                      <p
                        className={`font-mono text-sm font-medium tabular-nums ${
                          !hasLive
                            ? "text-[#71717A]"
                            : up
                              ? "text-[#00D084]"
                              : "text-[#FF3B30]"
                        }`}
                      >
                        {pnlPct}
                      </p>
                      <p
                        className={`font-mono text-xs tabular-nums ${
                          !hasLive
                            ? "text-[#71717A]"
                            : up
                              ? "text-[#00D084]/80"
                              : "text-[#FF3B30]/80"
                        }`}
                      >
                        {pnlMoney}
                      </p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
