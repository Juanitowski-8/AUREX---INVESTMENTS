"use client"

import { motion } from "framer-motion"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"
import type { AllocationItem } from "@/types"
import { ALLOCATION_COLORS, CHART_TOOLTIP_STYLE } from "./chart-styles"

type AllocationChartProps = {
  allocation: AllocationItem[]
}

export function AllocationChart({ allocation }: AllocationChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 }}
      className="h-full min-w-0"
    >
      <Card className="flex h-full flex-col border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            Allocation
          </p>
          <h3 className="text-lg font-semibold text-white">Asset allocation</h3>
        </div>
        <div className="my-4 min-h-[200px] min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {allocation.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value: number) => [
                  `${value.toFixed(1)}%`,
                  "Allocation",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-4">
          {allocation.slice(0, 6).map((item, index) => (
            <div key={item.name} className="flex min-w-0 items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
                }}
              />
              <span className="truncate text-xs text-[#A1A1AA]">{item.name}</span>
              <span className="ml-auto font-mono text-xs font-medium tabular-nums text-white">
                {item.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
