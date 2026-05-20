import { formatCurrency, formatPercent } from '@/lib/mock-data'
import type { Holding } from '@/types'

/** Precio de mercado mostrado en tablas (no confundir con precio medio de compra). */
export function formatHoldingMarkPrice(h: Holding): string {
  if (h.markPrice != null && h.markPrice > 0 && Number.isFinite(h.markPrice)) {
    return formatCurrency(h.markPrice)
  }
  if (h.asset.price > 0 && Number.isFinite(h.asset.price)) {
    return formatCurrency(h.asset.price)
  }
  return '—'
}

export function holdingHasLiveMarkPrice(h: Holding): boolean {
  if (h.markPrice != null && h.markPrice > 0) return true
  return h.asset.price > 0
}

export function formatHoldingPnL(h: Holding): { money: string; pct: string } {
  if (!holdingHasLiveMarkPrice(h)) {
    return { money: '—', pct: '—' }
  }
  const sign = h.profitLoss >= 0 ? '+' : '-'
  return {
    money: `${sign}${formatCurrency(Math.abs(h.profitLoss))}`,
    pct: formatPercent(h.profitLossPercent),
  }
}
