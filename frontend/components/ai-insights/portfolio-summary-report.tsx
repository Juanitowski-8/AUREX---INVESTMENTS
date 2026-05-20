"use client"

import { motion } from "framer-motion"
import { FileText, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { AIReport, RiskLevel } from "@/types"
import { RiskScoreGauge } from "./risk-score-gauge"

type PortfolioSummaryReportProps = {
  title: string
  summary: string
  riskScore: number
  riskLevel: RiskLevel
  generatedAt?: string
  report?: AIReport | null
}

function formatDate(iso?: string): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function PortfolioSummaryReport({
  title,
  summary,
  riskScore,
  riskLevel,
  generatedAt,
  report,
}: PortfolioSummaryReportProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="relative overflow-hidden border-[#C9A227]/20 bg-gradient-to-br from-[#111111] to-[#0A0A0A] p-4 sm:p-6 md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#C9A227]/10 blur-3xl" />

        <div className="relative z-10 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[#C9A227]/10 p-2">
                <Sparkles className="h-5 w-5 text-[#C9A227]" aria-hidden />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
                  Portfolio summary
                </p>
                <h2 className="text-xl font-semibold text-white md:text-2xl">
                  {report?.title ?? title}
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#A1A1AA] md:text-base">
              {summary}
            </p>

            <p className="mt-4 flex items-center gap-2 text-xs text-[#71717A]">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Report date: {formatDate(generatedAt ?? report?.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center border-t border-white/[0.06] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
              Risk level
            </p>
            <RiskScoreGauge score={riskScore} level={riskLevel} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
