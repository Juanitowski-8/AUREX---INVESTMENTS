import type { AIAdvisoryAlert, Transaction } from '@/types'

export function buildTransactionAdvisory(
  portfolioId: string,
  tx: Transaction,
  holdingsCount: number
): AIAdvisoryAlert {
  const symbol = tx.asset.symbol
  const isSell = tx.type === 'SELL'

  return {
    id: `adv_tx_${tx.id}`,
    portfolioId,
    category: isSell ? 'rebalance' : 'diversification',
    priority: 'info',
    title: isSell
      ? `Sale recorded: ${tx.quantity} ${symbol}`
      : `Purchase recorded: ${tx.quantity} ${symbol}`,
    message: isSell
      ? `You sold ${tx.quantity} ${symbol} at $${tx.price.toLocaleString('en-US')} per unit (total ≈ $${tx.total.toLocaleString('en-US')}). Portfolio now has ${holdingsCount} open position(s).`
      : `You bought ${tx.quantity} ${symbol} at $${tx.price.toLocaleString('en-US')} per unit. Portfolio now has ${holdingsCount} open position(s).`,
    suggestion: isSell
      ? holdingsCount === 0
        ? 'All positions are closed. Add new buys or generate analysis when you rebuild the book.'
        : `Review remaining exposure to ${symbol} and run analysis to refresh risk and concentration alerts.`
      : 'Consider setting a price alert and reviewing allocation so no single asset dominates the book.',
    createdAt: new Date().toISOString(),
  }
}
