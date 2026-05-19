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

/** Cantidad de activos: enteros sin ".0000"; fracciones solo si hace falta. */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value)
  const isWhole = Math.abs(value - rounded) < 1e-9
  if (isWhole) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      useGrouping: Math.abs(rounded) >= 10_000,
    }).format(rounded)
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
    useGrouping: false,
  }).format(value)
}
