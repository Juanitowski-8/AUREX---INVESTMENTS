"use client"

import { Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CreatePortfolioDialog } from "./create-portfolio-dialog"

type PortfolioEmptyStateProps = {
  onCreated: () => void | Promise<void>
  title?: string
  description?: string
}

export function PortfolioEmptyState({
  onCreated,
  title = "No portfolio yet",
  description = "Create a simulated portfolio to track holdings, performance, and AI insights.",
}: PortfolioEmptyStateProps) {
  return (
    <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-8 text-center sm:p-12">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A227]/10">
        <Wallet className="h-7 w-7 text-[#C9A227]" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#A1A1AA]">{description}</p>
      <div className="mt-6 flex justify-center">
        <CreatePortfolioDialog onCreated={onCreated} />
      </div>
    </Card>
  )
}
