"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getCachedPortfolioId,
  setCachedPortfolioId,
} from "@/lib/api/portfolio-context"
import {
  createPortfolio as createPortfolioApi,
  listPortfolios,
} from "@/services/portfolio.service"
import type { PortfolioDetail } from "@/types/api"

export function useActivePortfolio() {
  const [portfolios, setPortfolios] = useState<PortfolioDetail[]>([])
  const [portfolioId, setPortfolioIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await listPortfolios()
      setPortfolios(list)
      if (list.length === 0) {
        setPortfolioIdState(null)
        return
      }
      const cached = getCachedPortfolioId()
      const active = list.find((p) => p.id === cached) ?? list[0]!
      setCachedPortfolioId(active.id)
      setPortfolioIdState(active.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setActivePortfolio = useCallback((id: string) => {
    setCachedPortfolioId(id)
    setPortfolioIdState(id)
  }, [])

  const createPortfolio = useCallback(
    async (name: string) => {
      const created = await createPortfolioApi({ name })
      await refresh()
      setActivePortfolio(created.id)
      return created
    },
    [refresh, setActivePortfolio]
  )

  return {
    portfolios,
    portfolioId,
    loading,
    error,
    noPortfolio: !loading && portfolios.length === 0,
    refresh,
    setActivePortfolio,
    createPortfolio,
  }
}
