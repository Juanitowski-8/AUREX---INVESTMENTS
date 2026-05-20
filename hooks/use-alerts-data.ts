"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  createAlert,
  deleteAlert,
  getAlertEvents,
  getAlerts,
  updateAlert,
} from "@/services/alerts.service"
import { getMarketAssets } from "@/services/market.service"
import type { AlertEvent, AlertRule, MarketAsset } from "@/types"
import type { CreateAlertInput } from "@/types/api"

export function useAlertsData() {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<AlertRule[]>([])
  const [events, setEvents] = useState<AlertEvent[]>([])
  const [assets, setAssets] = useState<MarketAsset[]>([])

  const load = useCallback(async () => {
    const [alertsData, eventsData, assetsData] = await Promise.all([
      getAlerts(),
      getAlertEvents(),
      getMarketAssets(),
    ])
    setAlerts(alertsData)
    setEvents(eventsData)
    setAssets(assetsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    load().catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === "Active"),
    [alerts]
  )

  const triggeredAlerts = useMemo(
    () => alerts.filter((a) => a.status === "Triggered"),
    [alerts]
  )

  const disabledAlerts = useMemo(
    () => alerts.filter((a) => a.status === "Disabled"),
    [alerts]
  )

  const handleCreate = useCallback(
    async (input: CreateAlertInput) => {
      const created = await createAlert(input)
      setAlerts((prev) => [created, ...prev])
      return created
    },
    []
  )

  const handleToggle = useCallback(async (id: string) => {
    const rule = alerts.find((a) => a.id === id)
    if (!rule) return

    const nextStatus =
      rule.status === "Active" ? "Disabled" : ("Active" as const)
    const updated = await updateAlert(id, { status: nextStatus })
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
  }, [alerts])

  const handleDelete = useCallback(async (id: string) => {
    await deleteAlert(id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return {
    loading,
    alerts,
    events,
    assets,
    activeAlerts,
    triggeredAlerts,
    disabledAlerts,
    refresh: load,
    createAlert: handleCreate,
    toggleAlert: handleToggle,
    deleteAlert: handleDelete,
  }
}
