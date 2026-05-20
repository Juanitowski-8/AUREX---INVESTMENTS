"use client"

import { motion } from "framer-motion"
import { Clock, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/mock-data"
import { getAssetTypeBadgeClass } from "@/types/finance"
import type { AlertEvent } from "@/types"

type AlertEventsPanelProps = {
  events: AlertEvent[]
}

function formatEventTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function AlertEventsPanel({ events }: AlertEventsPanelProps) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
    >
      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            History
          </p>
          <h3 className="text-lg font-semibold text-white">Event log</h3>
          <p className="text-xs text-[#71717A]">
            GET /api/alerts/events · recent triggers
          </p>
        </div>

        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#71717A]">
            No trigger events yet.
          </p>
        ) : (
          <ul className="max-h-[520px] space-y-0 divide-y divide-white/[0.04] overflow-y-auto pr-1">
            {sorted.map((event) => (
              <li
                key={event.id}
                className="flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${getAssetTypeBadgeClass(event.asset.type)}`}
                >
                  {event.asset.symbol.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Zap
                      className="h-3.5 w-3.5 shrink-0 text-[#00D084]"
                      aria-hidden
                    />
                    <p className="text-sm font-medium text-white">
                      {event.asset.symbol} triggered
                    </p>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[#A1A1AA]">
                    {event.message ??
                      `Price at trigger: ${formatCurrency(event.priceAtTrigger)}`}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-[#71717A]">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatEventTime(event.triggeredAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.div>
  )
}
