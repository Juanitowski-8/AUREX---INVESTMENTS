"use client"

import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/mock-data"
import type { PortfolioPerformancePoint } from "@/types"
import { CHART_TOOLTIP_STYLE } from "./chart-styles"

type PortfolioPerformanceChartProps = {
  history: PortfolioPerformancePoint[]
}

export function PortfolioPerformanceChart({
  history,
}: PortfolioPerformanceChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
    >
      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              Performance
            </p>
            <h3 className="text-lg font-semibold text-white">
              Portfolio performance
            </h3>
            <p className="text-xs text-[#A1A1AA]">Last 60 days · live market trend</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-[#080808] p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-[#A1A1AA] hover:text-white"
            >
              1W
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-[#A1A1AA] hover:text-white"
            >
              1M
            </Button>
            <Button
              size="sm"
              className="h-7 bg-[#C9A227]/15 px-2 text-[10px] text-[#C9A227] hover:bg-[#C9A227]/25"
            >
              2M
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-[#A1A1AA] hover:text-white"
            >
              1Y
            </Button>
          </div>
        </div>
        <div className="aurex-chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="dashboardPortfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A227" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717A", fontSize: 11 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                minTickGap={28}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717A", fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={["dataMin - 5000", "dataMax + 5000"]}
                width={48}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value: number) => [formatCurrency(value), "Value"]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#C9A227"
                strokeWidth={2}
                fill="url(#dashboardPortfolioGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#E8C547", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}

