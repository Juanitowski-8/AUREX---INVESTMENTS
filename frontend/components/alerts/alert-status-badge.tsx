"use client"

import { Check, Clock, X } from "lucide-react"
import type { AlertStatus } from "@/types"

type AlertStatusBadgeProps = {
  status: AlertStatus
}

export function AlertStatusBadge({ status }: AlertStatusBadgeProps) {
  if (status === "Triggered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#00D084]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00D084]">
        <Check className="h-3 w-3" aria-hidden />
        Triggered
      </span>
    )
  }

  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#C9A227]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C9A227]">
        <Clock className="h-3 w-3" aria-hidden />
        Active
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#71717A]">
      <X className="h-3 w-3" aria-hidden />
      Disabled
    </span>
  )
}
