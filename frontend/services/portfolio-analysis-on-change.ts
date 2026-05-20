import { buildTransactionAdvisory } from '@/lib/ai/build-transaction-advisory'
import { prependAdvisoryAlert } from '@/lib/ai-advisory-store'
import { generatePortfolioAnalysis } from '@/services/ai.service'
import { getPortfolioHoldings } from '@/services/portfolio.service'
import type { Transaction } from '@/types'

/** Tras BUY/SELL: recalcula análisis IA y añade alerta del movimiento. */
export async function refreshAnalysisAfterTransaction(
  portfolioId: string,
  transaction: Transaction
): Promise<void> {
  const holdings = await getPortfolioHoldings(portfolioId, { reload: true })
  if (holdings.length > 0) {
    await generatePortfolioAnalysis(portfolioId)
  }

  const txAdvisory = buildTransactionAdvisory(
    portfolioId,
    transaction,
    holdings.length
  )
  prependAdvisoryAlert(txAdvisory)
}
