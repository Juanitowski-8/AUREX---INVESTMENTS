"use client"

import { Card } from "@/components/ui/card"

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.06] ${className ?? ""}`}
    />
  )
}

export function AIInsightsSkeleton() {
  return (
    <div className="space-y-6">
      <Pulse className="h-28 w-full rounded-xl" />
      <Pulse className="h-4 w-full max-w-2xl rounded-lg" />
      <Pulse className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Pulse className="h-72 rounded-xl" />
        <Pulse className="h-72 rounded-xl" />
      </div>
      <Card className="border-white/[0.06] bg-[#0A0A0A]/95 p-6">
        <Pulse className="mb-3 h-6 w-48" />
        <Pulse className="mb-2 h-4 w-full" />
        <Pulse className="h-4 w-5/6" />
      </Card>
    </div>
  )
}
