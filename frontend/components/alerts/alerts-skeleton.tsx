"use client"

import { Card } from "@/components/ui/card"

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.06] ${className ?? ""}`}
    />
  )
}

export function AlertsSkeleton() {
  return (
    <div className="space-y-6">
      <Pulse className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-white/[0.06] bg-[#0A0A0A]/95 p-4">
            <Pulse className="h-8 w-8" />
            <Pulse className="mt-3 h-7 w-12" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Pulse className="h-96 rounded-xl lg:col-span-2" />
        <Pulse className="h-96 rounded-xl" />
      </div>
    </div>
  )
}
