"use client"

import { AlertCircle } from "lucide-react"

type EducationalDisclaimerProps = {
  variant?: "banner" | "footer"
}

export function EducationalDisclaimer({
  variant = "banner",
}: EducationalDisclaimerProps) {
  const text =
    "Aurex is an educational portfolio intelligence platform. It does not execute real trades and does not provide financial advice."

  if (variant === "footer") {
    return (
      <p className="max-w-xl text-center text-xs leading-relaxed text-[#A1A1AA] md:text-left">
        {text}
      </p>
    )
  }

  return (
    <section
      className="relative z-10 border-t border-white/[0.06] px-6 py-8"
      aria-label="Educational disclaimer"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0A0A0A]/90 px-5 py-4 text-center sm:flex-row sm:text-left">
        <AlertCircle
          className="h-5 w-5 shrink-0 text-[#C9A227]/90"
          aria-hidden
        />
        <p className="text-xs leading-relaxed text-[#A1A1AA] sm:text-sm">{text}</p>
      </div>
    </section>
  )
}
