"use client"

import Link from "next/link"
import { Brain, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  advisoryCategoryLabel,
  type AIAdvisoryAlert,
  type AdvisoryPriority,
} from "@/types"

type AIAdvisorySectionProps = {
  advisories: AIAdvisoryAlert[]
}

function priorityColor(priority: AdvisoryPriority) {
  if (priority === "action") return "text-[#FF3B30]"
  if (priority === "warning") return "text-[#FFB800]"
  return "text-[#00D084]"
}

export function AIAdvisorySection({ advisories }: AIAdvisorySectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            AI intelligence
          </p>
          <h2 className="text-xl font-bold text-white">Advisory alerts</h2>
          <p className="mt-1 text-sm text-[#71717A]">
            Consejos generados tras tu último análisis de portafolio
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white hover:bg-white/5"
          asChild
        >
          <Link href="/ai-insights">Regenerar análisis</Link>
        </Button>
      </div>

      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5">
        {advisories.length === 0 ? (
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-3 h-8 w-8 text-[#71717A]" aria-hidden />
            <p className="text-sm text-[#A1A1AA]">
              Aún no hay alertas de IA. Ve a{" "}
              <Link href="/ai-insights" className="text-[#C9A227] hover:underline">
                AI Insights
              </Link>{" "}
              y pulsa &quot;Generate new analysis&quot;.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {advisories.map((item) => (
              <li key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A227]/10">
                  <Lightbulb className="h-4 w-4 text-[#C9A227]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#71717A]">
                    {advisoryCategoryLabel(item.category)} ·{" "}
                    <span className={priorityColor(item.priority)}>
                      {item.priority}
                    </span>
                  </p>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[#A1A1AA]">{item.message}</p>
                  <p className="mt-2 text-xs text-[#C9A227]">{item.suggestion}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
