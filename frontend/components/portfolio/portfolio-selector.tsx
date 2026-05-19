"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PortfolioDetail } from "@/types/api"

type PortfolioSelectorProps = {
  portfolios: PortfolioDetail[]
  value: string
  onChange: (id: string) => void
}

export function PortfolioSelector({
  portfolios,
  value,
  onChange,
}: PortfolioSelectorProps) {
  if (portfolios.length <= 1) return null

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[min(14rem,100%)] border-white/10 bg-[#111] text-sm text-white">
        <SelectValue placeholder="Select portfolio" />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#111] text-white">
        {portfolios.map((p) => (
          <SelectItem key={p.id} value={p.id} className="text-white">
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
