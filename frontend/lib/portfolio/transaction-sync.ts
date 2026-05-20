import type { Transaction } from '@/types'

const recentByPortfolio = new Map<string, Transaction[]>()

/** Incluye la transacción recién creada hasta que el API la devuelva en el listado. */
export function registerRecentTransaction(tx: Transaction): void {
  const list = recentByPortfolio.get(tx.portfolioId) ?? []
  recentByPortfolio.set(
    tx.portfolioId,
    [tx, ...list.filter((t) => t.id !== tx.id)]
  )
}

export function mergeTransactionsWithRecent(
  portfolioId: string,
  fromServer: Transaction[]
): Transaction[] {
  const recent = recentByPortfolio.get(portfolioId) ?? []
  const byId = new Map<string, Transaction>()
  for (const tx of [...recent, ...fromServer]) {
    byId.set(tx.id, tx)
  }
  return [...byId.values()].sort(
    (a, b) =>
      new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  )
}

export function reconcileRecentTransactions(
  portfolioId: string,
  fromServer: Transaction[]
): void {
  const serverIds = new Set(fromServer.map((t) => t.id))
  const recent = recentByPortfolio.get(portfolioId) ?? []
  const pending = recent.filter((t) => !serverIds.has(t.id))
  if (pending.length === 0) {
    recentByPortfolio.delete(portfolioId)
  } else {
    recentByPortfolio.set(portfolioId, pending)
  }
}

/** Excluye transacciones con cantidades imposibles que inflan el portafolio. */
export function sanitizeTransactionsForPortfolio(
  transactions: Transaction[]
): { valid: Transaction[]; excluded: number } {
  const valid: Transaction[] = []
  let excluded = 0

  for (const tx of transactions) {
    const notional = tx.quantity * tx.price
    if (
      !Number.isFinite(tx.quantity) ||
      !Number.isFinite(tx.price) ||
      tx.quantity <= 0 ||
      tx.quantity > 1_000_000 ||
      tx.price > 1_000_000_000 ||
      notional > 1_000_000_000
    ) {
      excluded += 1
      continue
    }
    valid.push(tx)
  }

  return { valid, excluded }
}
