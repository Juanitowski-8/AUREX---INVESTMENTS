import type { AIAdvisoryAlert } from '@/types'

const STORAGE_KEY = 'aurex_ai_advisories'

function loadAll(): AIAdvisoryAlert[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AIAdvisoryAlert[]) : []
  } catch {
    return []
  }
}

function saveAll(alerts: AIAdvisoryAlert[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.slice(0, 80)))
}

export function getStoredAdvisories(portfolioId: string): AIAdvisoryAlert[] {
  return loadAll()
    .filter((a) => a.portfolioId === portfolioId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function prependAdvisoryAlert(alert: AIAdvisoryAlert): void {
  const all = loadAll().filter((a) => a.id !== alert.id)
  saveAll([alert, ...all])
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aurex-ai-advisories-updated', {
        detail: { portfolioId: alert.portfolioId },
      })
    )
  }
}

export function mergeAdvisoriesFromReport(
  portfolioId: string,
  reportId: string,
  incoming: AIAdvisoryAlert[]
): AIAdvisoryAlert[] {
  const others = loadAll().filter(
    (a) => !(a.portfolioId === portfolioId && a.reportId === reportId)
  )
  const merged = [...incoming, ...others]
  saveAll(merged)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aurex-ai-advisories-updated', {
        detail: { portfolioId },
      })
    )
  }
  return getStoredAdvisories(portfolioId)
}
