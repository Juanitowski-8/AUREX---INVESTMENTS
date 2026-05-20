import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { mockDelay } from '@/lib/api/delay'
import type { BackendAlert, BackendAlertEvent } from '@/lib/api/backend-types'
import { mapAlertEvent, mapAlertRule, mapCreateAlertBody } from '@/lib/api/mappers'
import { withDataSource } from '@/lib/api/with-data-source'
import { getAsset, mockAlertEvents, mockAlertRules } from '@/lib/mock-data'
import type { AlertEvent, AlertRule } from '@/types'
import type { CreateAlertInput } from '@/types/api'

let alertRulesStore = [...mockAlertRules]

/** GET /api/alerts */
export async function getAlerts(): Promise<AlertRule[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return [...alertRulesStore]
    },
    async () => {
      const raw = await apiGet<BackendAlert[]>(API_ENDPOINTS.alerts.list)
      return raw.map(mapAlertRule)
    }
  )
}

/** GET /api/alerts/events */
export async function getAlertEvents(): Promise<AlertEvent[]> {
  return withDataSource(
    async () => {
      await mockDelay()
      return [...mockAlertEvents]
    },
    async () => {
      const raw = await apiGet<BackendAlertEvent[]>(API_ENDPOINTS.alerts.events)
      return raw.map(mapAlertEvent)
    }
  )
}

/** POST /api/alerts */
export async function createAlert(input: CreateAlertInput): Promise<AlertRule> {
  return withDataSource(
    async () => {
      await mockDelay()
      const asset = getAsset(input.assetId)
      if (!asset) {
        throw new Error(`Asset not found: ${input.assetId}`)
      }

      const created: AlertRule = {
        id: `alert_${Date.now()}`,
        assetId: input.assetId,
        asset,
        type: input.type,
        targetValue: input.targetValue,
        status: input.status ?? 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      }

      alertRulesStore = [created, ...alertRulesStore]
      return created
    },
    async () => {
      const raw = await apiPost<BackendAlert>(
        API_ENDPOINTS.alerts.list,
        mapCreateAlertBody(input)
      )
      return mapAlertRule(raw)
    },
    { fallbackToMockOnError: false }
  )
}

export type UpdateAlertInput = Partial<
  Pick<AlertRule, 'status' | 'targetValue' | 'type'>
>

/** PUT /api/alerts/{id} */
export async function updateAlert(
  id: string,
  patch: UpdateAlertInput
): Promise<AlertRule> {
  return withDataSource(
    async () => {
      await mockDelay()
      const index = alertRulesStore.findIndex((rule) => rule.id === id)
      if (index === -1) {
        throw new Error(`Alert not found: ${id}`)
      }

      const current = alertRulesStore[index]!
      const next: AlertRule = {
        ...current,
        ...patch,
        ...(patch.status === 'Active' && current.status === 'Triggered'
          ? { triggeredAt: undefined }
          : {}),
      }

      alertRulesStore = alertRulesStore.map((rule, i) =>
        i === index ? next : rule
      )
      return next
    },
    async () => {
      const body: Record<string, unknown> = {}
      if (patch.targetValue !== undefined) body.targetPrice = patch.targetValue
      if (patch.type !== undefined) {
        body.conditionType = patch.type === 'PRICE_BELOW' ? 'BELOW' : 'ABOVE'
      }
      if (patch.status !== undefined) {
        body.enabled = patch.status === 'Active'
      }
      const raw = await apiPut<BackendAlert>(API_ENDPOINTS.alerts.detail(id), body)
      return mapAlertRule(raw)
    },
    { fallbackToMockOnError: false }
  )
}

/** PATCH /api/alerts/{id}/toggle */
export async function toggleAlert(id: string): Promise<AlertRule> {
  return withDataSource(
    async () => {
      await mockDelay()
      const index = alertRulesStore.findIndex((rule) => rule.id === id)
      if (index === -1) throw new Error(`Alert not found: ${id}`)
      const current = alertRulesStore[index]!
      const next: AlertRule = {
        ...current,
        status: current.status === 'Active' ? 'Disabled' : 'Active',
      }
      alertRulesStore = alertRulesStore.map((rule, i) =>
        i === index ? next : rule
      )
      return next
    },
    async () => {
      const raw = await apiPatch<BackendAlert>(API_ENDPOINTS.alerts.toggle(id))
      return mapAlertRule(raw)
    },
    { fallbackToMockOnError: false }
  )
}

/** DELETE /api/alerts/{id} */
export async function deleteAlert(id: string): Promise<void> {
  return withDataSource(
    async () => {
      await mockDelay()
      alertRulesStore = alertRulesStore.filter((rule) => rule.id !== id)
    },
    () => apiDelete<void>(API_ENDPOINTS.alerts.detail(id)),
    { fallbackToMockOnError: false }
  )
}
