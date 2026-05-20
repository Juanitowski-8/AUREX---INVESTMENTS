"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  advisoryCategoryLabel,
  type AIAdvisoryAlert,
  type AdvisoryPriority,
} from "@/types"

type AIAdvisoryAlertsPanelProps = {
  advisories: AIAdvisoryAlert[]
}

function priorityStyles(priority: AdvisoryPriority) {
  switch (priority) {
    case "action":
      return {
        badge: "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20",
        icon: "bg-[#FF3B30]/10 text-[#FF3B30]",
      }
    case "warning":
      return {
        badge: "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20",
        icon: "bg-[#FFB800]/10 text-[#FFB800]",
      }
    default:
      return {
        badge: "bg-[#00D084]/10 text-[#00D084] border-[#00D084]/20",
        icon: "bg-[#00B4D8]/10 text-[#00B4D8]",
      }
  }
}

function formatTime(iso: string) {
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

export function AIAdvisoryAlertsPanel({ advisories }: AIAdvisoryAlertsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 }}
    >
      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-4 sm:p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#C9A227]/10 p-2">
              <Brain className="h-5 w-5 text-[#C9A227]" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
                AI alerts
              </p>
              <h3 className="text-lg font-semibold text-white">
                Advisory recommendations
              </h3>
              <p className="text-xs text-[#71717A]">
                Generated from your latest analysis — educational, not financial advice
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#C9A227] hover:bg-[#C9A227]/10 hover:text-[#E8C547]"
            asChild
          >
            <Link href="/alerts">View in Alerts</Link>
          </Button>
        </div>

        {advisories.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#71717A]">
            Generate a new analysis to receive personalized advisory alerts based on
            your holdings.
          </p>
        ) : (
          <ul className="space-y-3">
            {advisories.map((item) => {
              const styles = priorityStyles(item.priority)
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                    >
                      <Lightbulb className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles.badge}`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wide text-[#71717A]">
                          {advisoryCategoryLabel(item.category)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                        {item.message}
                      </p>
                      <p className="mt-2 rounded-lg border border-[#C9A227]/15 bg-[#C9A227]/5 px-3 py-2 text-xs leading-relaxed text-[#E8C547]">
                        <span className="font-semibold text-[#C9A227]">Suggestion: </span>
                        {item.suggestion}
                      </p>
                      <p className="mt-2 text-[10px] text-[#71717A]">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </motion.div>
  )
}
