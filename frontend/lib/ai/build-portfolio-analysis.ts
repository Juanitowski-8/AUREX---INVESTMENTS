import {
  computeConcentration,
  computeMarketExposure,
} from '@/lib/ai/portfolio-exposure'
import type { Holding, RiskLevel } from '@/types'

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 40) return 'Low'
  if (score < 70) return 'Moderate'
  return 'High'
}

export function computeRiskScore(holdings: Holding[]): number {
  if (holdings.length === 0) return 25
  const { top3Pct } = computeConcentration(holdings)
  const avgVolatility =
    holdings.reduce((s, h) => s + Math.abs(h.profitLossPercent), 0) /
    holdings.length
  return Math.min(
    95,
    Math.max(
      15,
      Math.round(30 + top3Pct * 0.4 + avgVolatility * 0.3 + holdings.length * 5)
    )
  )
}

export function buildPortfolioAnalysisSummary(holdings: Holding[]): string {
  if (holdings.length === 0) {
    return 'No positions in this portfolio yet. Add buy transactions from Portfolio or Dashboard, then generate a new analysis.'
  }

  const { largest, top3Pct, level } = computeConcentration(holdings)
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0)
  const exposure = computeMarketExposure(holdings)
  const topExposure = exposure[0]

  const concentrationLabel =
    level === 'high'
      ? 'high concentration risk'
      : level === 'elevated'
        ? 'moderately concentrated'
        : 'relatively diversified'

  const largestLine = largest
    ? `${largest.asset.symbol} is the largest holding at ${largest.allocation.toFixed(1)}% of allocated value. `
    : ''

  const exposureLine = topExposure
    ? `${topExposure.label} represent ${topExposure.allocation.toFixed(1)}% of market exposure. `
    : ''

  return `Your portfolio is valued at approximately $${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} across ${holdings.length} position${holdings.length === 1 ? '' : 's'}. ${largestLine}The top three holdings account for ${top3Pct.toFixed(1)}% of the book, indicating ${concentrationLabel}. ${exposureLine}This snapshot is based on your recorded transactions and current market prices (educational simulation — not financial advice).`
}

export function buildPortfolioAnalysisObservations(
  holdings: Holding[]
): string[] {
  if (holdings.length === 0) {
    return [
      'Add at least one buy transaction before generating analysis.',
    ]
  }

  const { top3, top3Pct, largest } = computeConcentration(holdings)
  const exposure = computeMarketExposure(holdings)
  const best = [...holdings].sort(
    (a, b) => b.profitLossPercent - a.profitLossPercent
  )[0]
  const worst = [...holdings].sort(
    (a, b) => a.profitLossPercent - b.profitLossPercent
  )[0]

  const observations: string[] = []

  if (largest) {
    observations.push(
      `${largest.asset.symbol} is the largest position at ${largest.allocation.toFixed(1)}% of portfolio weight`
    )
  }
  observations.push(
    `Top three holdings represent ${top3Pct.toFixed(1)}% of allocation (${top3.map((h) => h.asset.symbol).join(', ')})`
  )

  const crypto = exposure.find((e) => e.type === 'CRYPTO')
  if (crypto) {
    observations.push(
      `${crypto.label} sleeve accounts for ${crypto.allocation.toFixed(1)}% of market exposure`
    )
  }
  if (best) {
    observations.push(
      `${best.asset.symbol} shows ${best.profitLossPercent >= 0 ? '+' : ''}${best.profitLossPercent.toFixed(1)}% unrealized move — strongest performer in the book`
    )
  }
  if (worst && worst.id !== best?.id) {
    observations.push(
      `${worst.asset.symbol} shows ${worst.profitLossPercent.toFixed(1)}% unrealized P/L — monitor single-name risk`
    )
  }
  observations.push('Educational simulation only — not financial advice')

  return observations.slice(0, 6)
}

export function buildAnalysisTitle(generatedAt: string): string {
  const date = new Date(generatedAt)
  return `Analysis · ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`
}
