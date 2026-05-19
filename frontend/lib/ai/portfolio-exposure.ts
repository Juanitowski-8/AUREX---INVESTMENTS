import type { AssetType, Holding } from "@/types"

export type ExposureSlice = {
  type: AssetType
  label: string
  allocation: number
  holdingCount: number
}

const TYPE_LABELS: Record<AssetType, string> = {
  CRYPTO: "Digital assets",
  STOCK: "Equities",
  ETF: "ETFs & funds",
  CASH: "Cash & equivalents",
}

export function computeConcentration(holdings: Holding[]) {
  const sorted = [...holdings].sort((a, b) => b.allocation - a.allocation)
  const top3 = sorted.slice(0, 3)
  const top3Pct = top3.reduce((sum, h) => sum + h.allocation, 0)
  const largest = sorted[0]

  let level: "balanced" | "elevated" | "high" = "balanced"
  if (top3Pct > 70) level = "high"
  else if (top3Pct > 50) level = "elevated"

  return { top3, top3Pct, largest, level }
}

export function computeMarketExposure(holdings: Holding[]): ExposureSlice[] {
  const map = new Map<AssetType, { allocation: number; count: number }>()

  for (const holding of holdings) {
    const current = map.get(holding.asset.type) ?? { allocation: 0, count: 0 }
    map.set(holding.asset.type, {
      allocation: current.allocation + holding.allocation,
      count: current.count + 1,
    })
  }

  return Array.from(map.entries())
    .map(([type, data]) => ({
      type,
      label: TYPE_LABELS[type],
      allocation: data.allocation,
      holdingCount: data.count,
    }))
    .sort((a, b) => b.allocation - a.allocation)
}
