"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Clock, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAIReport } from "@/services/ai.service"
import type { AIReport, RiskLevel } from "@/types"
import { RiskScoreGauge } from "./risk-score-gauge"

type HistoricalReportsListProps = {
  reports: AIReport[]
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function riskPillClass(level: RiskLevel): string {
  if (level === "Low") return "text-[#00D084]"
  if (level === "Moderate") return "text-[#FFB800]"
  return "text-[#FF3B30]"
}

export function HistoricalReportsList({ reports }: HistoricalReportsListProps) {
  const [selected, setSelected] = useState<AIReport | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const openReport = async (id: string) => {
    setLoadingId(id)
    try {
      const report = await getAIReport(id)
      if (report) setSelected(report)
    } finally {
      setLoadingId(null)
    }
  }

  if (reports.length === 0) {
    return null
  }

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Clock className="h-5 w-5 text-[#71717A]" aria-hidden />
              Historical AI reports
            </h2>
            <p className="text-xs text-[#71717A]">
              GET /api/ai/analyses · archived snapshots
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 transition-colors hover:border-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <FileText className="h-4 w-4 text-[#C9A227]" aria-hidden />
                      <h3 className="truncate font-medium text-white">
                        {report.title}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold uppercase ${riskPillClass(report.riskLevel)}`}
                      >
                        {report.riskLevel}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-[#A1A1AA]">
                      {report.summary}
                    </p>
                    <p className="mt-1 text-xs text-[#71717A]">
                      {formatDate(report.createdAt)} · Score {report.riskScore}/100
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingId === report.id}
                    className="shrink-0 text-[#C9A227] hover:bg-[#C9A227]/10"
                    onClick={() => openReport(report.id)}
                  >
                    View report
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-[#0A0A0A] text-white sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription className="text-[#A1A1AA]">
                  {formatDate(selected.createdAt)} · GET /api/ai/analyses/
                  {selected.id}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed text-[#A1A1AA]">
                {selected.summary}
              </p>
              <div className="flex justify-center py-2">
                <RiskScoreGauge
                  score={selected.riskScore}
                  level={selected.riskLevel}
                />
              </div>
              <ul className="space-y-2 border-t border-white/[0.06] pt-4">
                {selected.observations.map((obs, i) => (
                  <li
                    key={i}
                    className="text-sm text-[#A1A1AA] before:mr-2 before:text-[#C9A227] before:content-['•']"
                  >
                    {obs}
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
