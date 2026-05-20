"use client"

import { motion } from "framer-motion"
import { Brain, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
type AIInsightsHeaderProps = {
  generating: boolean
  disabled?: boolean
  onGenerate: () => void
}

export function AIInsightsHeader({
  generating,
  disabled = false,
  onGenerate,
}: AIInsightsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0A0A]/90 p-4 sm:p-5 md:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#C9A227]" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
              Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            AI portfolio insights
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#A1A1AA]">
            Analysis from your holdings and live prices. Each run creates advisory
            alerts with actionable suggestions (educational — not financial advice).
          </p>
        </div>
        <Button
          size="sm"
          disabled={generating || disabled}
          onClick={onGenerate}
          className="w-full shrink-0 bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547] disabled:opacity-70 sm:w-auto"
        >
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
          )}
          {generating ? "Generating…" : "Generate new analysis"}
        </Button>
      </div>
    </motion.div>
  )
}
