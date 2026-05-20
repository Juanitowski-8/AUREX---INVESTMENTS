"use client"

import { AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

type AIInsightsDisclaimerProps = {
  compact?: boolean
}

export function AIInsightsDisclaimer({ compact = false }: AIInsightsDisclaimerProps) {
  return (
    <Card
      className={`border-[#C9A227]/20 bg-[#C9A227]/5 ${
        compact ? "p-3" : "p-4 md:p-5"
      }`}
      role="note"
      aria-label="Educational disclaimer"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A227]"
          aria-hidden
        />
        <div>
          <p className="text-sm font-semibold text-white">
            Educational insights only. Not financial advice.
          </p>
          <p
            className={`mt-1 leading-relaxed text-[#A1A1AA] ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            Aurex presents simulated portfolio intelligence for learning purposes.
            Observations describe risk, concentration, and market exposure — they
            do not instruct you to buy, sell, or hold any security. Consult a
            qualified professional before making investment decisions.
          </p>
        </div>
      </div>
    </Card>
  )
}
