"use client"

import { Card } from "@/components/ui/card"

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.06] ${className ?? ""}`}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Pulse className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="border-white/[0.06] bg-[#0A0A0A]/95 p-5"
          >
            <Pulse className="mb-3 h-8 w-8" />
            <Pulse className="mb-2 h-3 w-24" />
            <Pulse className="h-7 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Pulse className="h-[360px] rounded-xl lg:col-span-2" />
        <Pulse className="h-[360px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Pulse className="h-72 rounded-xl lg:col-span-2" />
        <Pulse className="h-72 rounded-xl" />
      </div>
      <Pulse className="h-64 w-full rounded-xl" />
    </div>
  )
}
