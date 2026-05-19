"use client"

import { motion } from "framer-motion"
import { BellRing } from "lucide-react"
import { IS_MOCK_MODE } from "@/lib/config"

type AlertsHeaderProps = {
  actions?: React.ReactNode
}

export function AlertsHeader({ actions }: AlertsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0A0A]/90 p-4 sm:p-5 md:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#C9A227]" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
              Market alerts
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Price alerts
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#A1A1AA]">
            Monitor crypto and equities. Get notified when prices cross your
            {IS_MOCK_MODE
              ? "Educational price alerts on simulated market data."
              : "Price alerts synced with your account on the server."}
          </p>
        </div>
        {actions ? (
          <div className="flex flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    </motion.div>
  )
}
