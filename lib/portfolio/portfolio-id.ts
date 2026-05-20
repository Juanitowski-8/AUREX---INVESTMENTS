export function normalizePortfolioId(id: string): string {
  return id.trim().toLowerCase()
}

export function portfolioIdsEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (a == null || b == null) return false
  return normalizePortfolioId(a) === normalizePortfolioId(b)
}
