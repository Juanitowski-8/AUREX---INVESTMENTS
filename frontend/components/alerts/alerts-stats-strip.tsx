"use client"

import { motion } from "framer-motion"
import { Activity, Bell, CheckCircle2, PauseCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

type AlertsStatsStripProps = {
  activeCount: number
  triggeredCount: number
  disabledCount: number
  eventsCount: number
}

export function AlertsStatsStrip({
  activeCount,
  triggeredCount,
  disabledCount,
  eventsCount,
}: AlertsStatsStripProps) {
  const stats = [
    {
      label: "Active",
      value: activeCount,
      icon: Bell,
      color: "text-[#C9A227]",
      delay: 0,
    },
    {
      label: "Triggered",
      value: triggeredCount,
      icon: CheckCircle2,
      color: "text-[#00D084]",
      delay: 0.05,
    },
    {
      label: "Disabled",
      value: disabledCount,
      icon: PauseCircle,
      color: "text-[#71717A]",
      delay: 0.1,
    },
    {
      label: "Events",
      value: eventsCount,
      icon: Activity,
      color: "text-white",
      delay: 0.15,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: stat.delay }}
          >
            <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4">
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-lg bg-white/[0.04] p-2 ${stat.color}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <p
                  className={`font-mono text-2xl font-bold tabular-nums ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#71717A]">
                {stat.label}
              </p>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
