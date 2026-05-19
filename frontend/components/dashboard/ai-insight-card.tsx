"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AIInsight, RiskLevel } from "@/types"

function riskBadgeClass(level: RiskLevel): string {
  if (level === "Low") return "bg-[#00D084]/10 text-[#00D084]"
  if (level === "Moderate") return "bg-[#FFB800]/10 text-[#FFB800]"
  return "bg-[#FF3B30]/10 text-[#FF3B30]"
}

type AIInsightCardProps = {
  insight: AIInsight
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  const preview =
    insight.content.length > 160
      ? `${insight.content.slice(0, 160)}…`
      : insight.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      className="h-full"
    >
      <Card className="relative flex h-full flex-col overflow-hidden border-[#C9A227]/20 bg-gradient-to-br from-[#111111] to-[#0A0A0A] p-4 sm:p-5 md:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#C9A227]/10 blur-3xl" />
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-[#C9A227]/10 p-2.5">
              <Sparkles className="h-5 w-5 text-[#C9A227]" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
                AI analysis
              </p>
              <h3 className="text-lg font-semibold text-white">Market insight</h3>
            </div>
          </div>

          <p className="mb-3 text-sm font-medium text-white">{insight.title}</p>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs text-[#A1A1AA]">Risk score</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${riskBadgeClass(insight.riskLevel)}`}
              >
                {insight.riskLevel}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00D084] via-[#FFB800] to-[#FF3B30]"
                style={{ width: `${insight.riskScore}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-xs tabular-nums text-[#71717A]">
              {insight.riskScore} / 100
            </p>
          </div>

          <p className="mb-4 flex-1 text-sm leading-relaxed text-[#A1A1AA]">
            {preview}
          </p>

          {insight.recommendations.length > 0 && (
            <ul className="mb-4 space-y-1.5 border-t border-white/[0.06] pt-3">
              {insight.recommendations.slice(0, 2).map((rec) => (
                <li
                  key={rec}
                  className="flex gap-2 text-xs text-[#A1A1AA] before:shrink-0 before:text-[#C9A227] before:content-['•']"
                >
                  {rec}
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-auto w-fit p-0 text-[#C9A227] hover:bg-transparent hover:text-[#E8C547]"
            asChild
          >
            <Link href="/ai-insights">View full analysis →</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
