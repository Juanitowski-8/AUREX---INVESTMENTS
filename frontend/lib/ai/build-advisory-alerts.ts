import {
  computeConcentration,
  computeMarketExposure,
} from '@/lib/ai/portfolio-exposure'
import type { AIAdvisoryAlert, AIReport, Holding } from '@/types'

function advisory(
  partial: Omit<AIAdvisoryAlert, 'id' | 'createdAt'> & { createdAt?: string }
): AIAdvisoryAlert {
  return {
    id: `adv_${partial.portfolioId}_${partial.category}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    ...partial,
  }
}

/** Genera alertas de consejo educativo a partir del análisis y holdings. */
export function buildAdvisoryAlertsFromAnalysis(
  portfolioId: string,
  holdings: Holding[],
  report: AIReport
): AIAdvisoryAlert[] {
  if (holdings.length === 0) return []

  const alerts: AIAdvisoryAlert[] = []
  const { largest, top3Pct, level } = computeConcentration(holdings)
  const exposure = computeMarketExposure(holdings)
  const createdAt = report.createdAt
  const reportId = report.id

  if (largest && largest.allocation >= 50) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'concentration',
        priority: 'warning',
        title: `High weight in ${largest.asset.symbol}`,
        message: `${largest.asset.symbol} represents ${largest.allocation.toFixed(1)}% of your portfolio — well above a typical 20–30% single-name guideline.`,
        suggestion: `Consider trimming ${largest.asset.symbol} or adding positions in other assets (ETFs, other sectors, or crypto) to reduce single-stock risk.`,
        createdAt,
      })
    )
  }

  if (level === 'high' || top3Pct > 75) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'concentration',
        priority: 'action',
        title: 'Portfolio heavily concentrated',
        message: `Your top three holdings account for ${top3Pct.toFixed(1)}% of allocated value.`,
        suggestion:
          'Spread capital across more names or asset classes. A simple target: no single position above 25% and at least 4–5 uncorrelated holdings.',
        createdAt,
      })
    )
  }

  if (report.riskScore >= 70) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'risk',
        priority: 'action',
        title: `Elevated risk score (${report.riskScore}/100)`,
        message: `Analysis rates this book as ${report.riskLevel} risk based on concentration and volatility.`,
        suggestion:
          'Review position sizes, add defensive assets (bond ETFs, stablecoins), or set price alerts below key support levels before adding more risk.',
        createdAt,
      })
    )
  } else if (report.riskScore < 40) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'risk',
        priority: 'info',
        title: 'Risk profile looks balanced',
        message: `Risk score is ${report.riskScore}/100 (${report.riskLevel}).`,
        suggestion:
          'Maintain discipline: rebalance if one holding drifts above your target weight, and keep logging transactions for accurate tracking.',
        createdAt,
      })
    )
  }

  const crypto = exposure.find((e) => e.type === 'CRYPTO')
  if (crypto && crypto.allocation >= 70) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'diversification',
        priority: 'warning',
        title: 'Crypto-heavy exposure',
        message: `Digital assets are ${crypto.allocation.toFixed(1)}% of market exposure.`,
        suggestion:
          'Add equities or ETFs to smooth drawdowns. Many investors cap crypto at 20–40% of total portfolio depending on goals.',
        createdAt,
      })
    )
  }

  const equities = exposure.find((e) => e.type === 'STOCK' || e.type === 'ETF')
  if (holdings.length >= 2 && !crypto && equities && equities.allocation >= 90) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'diversification',
        priority: 'info',
        title: 'Equity-focused book',
        message: 'Nearly all exposure is in stocks/ETFs with little alternative allocation.',
        suggestion:
          'Optional: add a small crypto or commodity sleeve, or a broad bond ETF, to diversify across macro regimes.',
        createdAt,
      })
    )
  }

  if (holdings.length === 1 && largest) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'diversification',
        priority: 'action',
        title: 'Single-position portfolio',
        message: `All value is in ${largest.asset.symbol}.`,
        suggestion:
          'Add at least two more assets via Buy transactions (e.g. index ETF + a second stock) before the next analysis run.',
        createdAt,
      })
    )
  }

  if (holdings.length >= 2 && holdings.length <= 3) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'diversification',
        priority: 'info',
        title: 'Room to diversify',
        message: `Only ${holdings.length} positions — a thin book can amplify volatility.`,
        suggestion:
          'Aim for 4–6 positions across sectors or asset types so one name does not dominate outcomes.',
        createdAt,
      })
    )
  }

  const worst = [...holdings].sort(
    (a, b) => a.profitLossPercent - b.profitLossPercent
  )[0]
  if (worst && worst.profitLossPercent <= -10) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'performance',
        priority: 'warning',
        title: `${worst.asset.symbol} under pressure`,
        message: `${worst.asset.symbol} shows ${worst.profitLossPercent.toFixed(1)}% unrealized P/L.`,
        suggestion: `Set a price alert on ${worst.asset.symbol} at your review level, or decide a max loss threshold before reducing size (educational — not a sell signal).`,
        createdAt,
      })
    )
  }

  const best = [...holdings].sort(
    (a, b) => b.profitLossPercent - a.profitLossPercent
  )[0]
  if (best && best.profitLossPercent >= 20 && best.id !== worst?.id) {
    alerts.push(
      advisory({
        portfolioId,
        reportId,
        category: 'performance',
        priority: 'info',
        title: `${best.asset.symbol} leading gains`,
        message: `${best.asset.symbol} is up ${best.profitLossPercent.toFixed(1)}% unrealized.`,
        suggestion: `Consider partial profit-taking or trailing a stop: lock in some gains while letting the rest run. Rebalance if ${best.asset.symbol} now exceeds your target weight.`,
        createdAt,
      })
    )
  }

  if (largest && largest.allocation >= 35 && holdings.length >= 3) {
    const others = holdings.filter((h) => h.id !== largest.id)
    const smallest = others.sort((a, b) => a.allocation - b.allocation)[0]
    if (smallest) {
      alerts.push(
        advisory({
          portfolioId,
          reportId,
          category: 'rebalance',
          priority: 'info',
          title: 'Rebalance opportunity',
          message: `${largest.asset.symbol} (${largest.allocation.toFixed(1)}%) vs ${smallest.asset.symbol} (${smallest.allocation.toFixed(1)}%).`,
          suggestion: `Educational idea: redirect new buys toward ${smallest.asset.symbol} or trim ${largest.asset.symbol} until weights align with your plan — no trade required today.`,
          createdAt,
        })
      )
    }
  }

  return alerts.slice(0, 8)
}
