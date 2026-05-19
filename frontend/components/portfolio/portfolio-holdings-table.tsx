"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/mock-data"
import { formatQuantity } from "@/lib/number-parse"
import { getAssetTypeBadgeClass } from "@/types/finance"
import type { Holding } from "@/types"

type SortKey =
  | "asset"
  | "allocation"
  | "profitLoss"
  | "profitLossPercent"
  | "quantity"

type PortfolioHoldingsTableProps = {
  holdings: Holding[]
}

export function PortfolioHoldingsTable({ holdings }: PortfolioHoldingsTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("allocation")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const sortedHoldings = useMemo(() => {
    const list = [...holdings]
    const dir = sortOrder === "asc" ? 1 : -1
    list.sort((a, b) => {
      switch (sortBy) {
        case "asset":
          return a.asset.symbol.localeCompare(b.asset.symbol) * dir
        case "quantity":
          return (a.quantity - b.quantity) * dir
        case "profitLoss":
          return (a.profitLoss - b.profitLoss) * dir
        case "profitLossPercent":
          return (a.profitLossPercent - b.profitLossPercent) * dir
        case "allocation":
        default:
          return (a.allocation - b.allocation) * dir
      }
    })
    return list
  }, [holdings, sortBy, sortOrder])

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortOrder("desc")
    }
  }

  const SortHead = ({
    label,
    sortKey,
    align = "left",
  }: {
    label: string
    sortKey: SortKey
    align?: "left" | "right"
  }) => (
    <th
      className={`cursor-pointer select-none px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#71717A] transition-colors hover:text-white ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => toggleSort(sortKey)}
    >
      <span
        className={`inline-flex items-center gap-1 ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden />
      </span>
    </th>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
    >
      <Card className="overflow-hidden border-white/[0.06] bg-[#0A0A0A]/95">
        <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5 md:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            Holdings
          </p>
          <h3 className="text-lg font-semibold text-white">Position breakdown</h3>
          <p className="text-xs text-[#71717A]">
            {holdings.length} assets · sortable columns
          </p>
        </div>

        <div className="aurex-table-scroll">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <SortHead label="Asset" sortKey="asset" />
                <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#71717A]">
                  Symbol
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#71717A]">
                  Type
                </th>
                <SortHead label="Quantity" sortKey="quantity" align="right" />
                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[#71717A]">
                  Avg buy
                </th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[#71717A]">
                  Current
                </th>
                <SortHead label="P/L" sortKey="profitLoss" align="right" />
                <SortHead label="P/L %" sortKey="profitLossPercent" align="right" />
                <SortHead label="Allocation" sortKey="allocation" align="right" />
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((holding) => {
                const up = holding.profitLoss >= 0
                return (
                  <tr
                    key={holding.id}
                    className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${getAssetTypeBadgeClass(holding.asset.type)}`}
                        >
                          {holding.asset.symbol.slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {holding.asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-sm text-[#A1A1AA]">
                      {holding.asset.symbol}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${getAssetTypeBadgeClass(holding.asset.type)}`}
                      >
                        {holding.asset.type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-sm tabular-nums text-white">
                      {formatQuantity(holding.quantity)}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-sm tabular-nums text-[#A1A1AA]">
                      {formatCurrency(holding.avgBuyPrice)}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-sm tabular-nums text-white">
                      {formatCurrency(holding.asset.price)}
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-1 font-mono text-sm font-medium tabular-nums ${
                          up ? "text-[#00D084]" : "text-[#FF3B30]"
                        }`}
                      >
                        {up ? (
                          <TrendingUp className="h-3 w-3" aria-hidden />
                        ) : (
                          <TrendingDown className="h-3 w-3" aria-hidden />
                        )}
                        {up ? "+" : ""}
                        {formatCurrency(holding.profitLoss)}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-3.5 text-right font-mono text-sm font-medium tabular-nums ${
                        up ? "text-[#00D084]" : "text-[#FF3B30]"
                      }`}
                    >
                      {formatPercent(holding.profitLossPercent)}
                    </td>
                    <td className="px-3 py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-[#C9A227]"
                            style={{ width: `${Math.min(holding.allocation, 100)}%` }}
                          />
                        </div>
                        <span className="w-12 font-mono text-xs tabular-nums text-[#A1A1AA]">
                          {holding.allocation.toFixed(1)}%
                        </span>
                      </div>
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
