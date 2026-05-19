/** Parsea cantidades decimales sin notación científica accidental (p. ej. "12e131"). */
export function parsePositiveDecimal(value: string): number | null {
  const trimmed = value.trim().replace(',', '.')
  if (!trimmed) return null
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function formatUnitPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2)
  if (price >= 1) return price.toFixed(4)
  return price.toFixed(6)
}
