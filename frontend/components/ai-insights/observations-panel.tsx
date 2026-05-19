"use client"

import { motion } from "framer-motion"
import { ClipboardList } from "lucide-react"
import { Card } from "@/components/ui/card"

type ObservationsPanelProps = {
  observations: string[]
}

export function ObservationsPanel({ observations }: ObservationsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
    >
      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-[#FFB800]/10 p-2">
            <ClipboardList className="h-5 w-5 text-[#FFB800]" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              Analysis
            </p>
            <h3 className="text-lg font-semibold text-white">
              Suggested observations
            </h3>
            <p className="text-xs text-[#71717A]">
              Educational notes — not trade instructions
            </p>
          </div>
        </div>

        {observations.length === 0 ? (
          <p className="text-sm text-[#71717A]">
            No observations available. Generate a new analysis to refresh this
            section.
          </p>
        ) : (
          <ol className="space-y-3">
            {observations.map((observation, index) => (
              <li
                key={`${index}-${observation.slice(0, 24)}`}
                className="flex gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/10 text-xs font-bold text-[#C9A227]">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-[#A1A1AA]">
                  {observation}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </motion.div>
  )
}
