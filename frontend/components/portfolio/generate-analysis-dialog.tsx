"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IS_MOCK_MODE } from "@/lib/config"
import { dispatchPortfolioUpdated } from "@/lib/portfolio-events"
import { generatePortfolioAnalysis } from "@/services/ai.service"
import type { AIReport } from "@/types"
import { toast } from "sonner"

type GenerateAnalysisDialogProps = {
  portfolioId: string
  onGenerated?: () => void | Promise<void>
}

export function GenerateAnalysisDialog({
  portfolioId,
  onGenerated,
}: GenerateAnalysisDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<AIReport | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setReport(null)

    generatePortfolioAnalysis(portfolioId)
      .then(async (result) => {
        if (cancelled) return
        setReport(result)
        toast.success("Analysis generated")
        dispatchPortfolioUpdated(portfolioId)
        await onGenerated?.()
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Could not generate analysis"
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, portfolioId])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setReport(null)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white hover:border-[#C9A227]/30 hover:bg-[#C9A227]/10"
        >
          <Sparkles className="mr-2 h-4 w-4 text-[#C9A227]" aria-hidden />
          Generate AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#0A0A0A] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C9A227]" aria-hidden />
            AI portfolio analysis
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            {IS_MOCK_MODE
              ? "Analysis from your current holdings (simulated prices)."
              : "POST /api/ai/portfolio-summary — full history on AI Insights."}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-[#A1A1AA]">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9A227]" aria-hidden />
            <p className="text-sm">Analyzing portfolio positions…</p>
          </div>
        )}

        {!loading && report && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-white">{report.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                {report.summary}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className="text-xs text-[#71717A]">Risk score</span>
              <span className="font-mono text-sm font-semibold text-[#C9A227]">
                {report.riskScore} / 100
              </span>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  report.riskLevel === "Low"
                    ? "bg-[#00D084]/10 text-[#00D084]"
                    : report.riskLevel === "Moderate"
                      ? "bg-[#FFB800]/10 text-[#FFB800]"
                      : "bg-[#FF3B30]/10 text-[#FF3B30]"
                }`}
              >
                {report.riskLevel}
              </span>
            </div>
            {report.observations.length > 0 && (
              <ul className="space-y-2 border-t border-white/[0.06] pt-3">
                {report.observations.slice(0, 3).map((obs) => (
                  <li
                    key={obs}
                    className="text-xs text-[#A1A1AA] before:mr-2 before:text-[#C9A227] before:content-['•']"
                  >
                    {obs}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            asChild
            className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
          >
            <Link href="/ai-insights">Open AI Insights</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
