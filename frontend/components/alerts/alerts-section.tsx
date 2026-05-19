"use client"

import { Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { AlertRule } from "@/types"
import { AlertRuleCard } from "./alert-rule-card"

type AlertsSectionProps = {
  title: string
  description: string
  alerts: AlertRule[]
  emptyMessage: string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function AlertsSection({
  title,
  description,
  alerts,
  emptyMessage,
  onToggle,
  onDelete,
}: AlertsSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs text-[#71717A]">{description}</p>
      </div>

      {alerts.length === 0 ? (
        <Card className="border-dashed border-white/[0.08] bg-[#0A0A0A]/60 p-8 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-[#71717A]" aria-hidden />
          <p className="text-sm text-[#A1A1AA]">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertRuleCard
              key={alert.id}
              alert={alert}
              index={index}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
