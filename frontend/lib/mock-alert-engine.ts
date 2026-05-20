import { getCachedMarketAsset, refreshLiveMarketCache } from '@/lib/live-market-cache'
import type { AlertEvent, AlertRule } from '@/types'

let rulesStore: AlertRule[] = []
let eventsStore: AlertEvent[] = []

const EVENTS_KEY = 'aurex_mock_alert_events'

function loadEvents() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (raw) eventsStore = JSON.parse(raw) as AlertEvent[]
  } catch {
    eventsStore = []
  }
}

function saveEvents() {
  if (typeof window === 'undefined') return
  localStorage.setItem(EVENTS_KEY, JSON.stringify(eventsStore.slice(0, 50)))
}

loadEvents()

export function setMockAlertRules(rules: AlertRule[]) {
  rulesStore = [...rules]
}

export function getMockAlertRules(): AlertRule[] {
  return [...rulesStore]
}

export function getMockAlertEvents(): AlertEvent[] {
  return [...eventsStore].sort(
    (a, b) =>
      new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
  )
}

export async function evaluateMockAlerts(): Promise<AlertEvent[]> {
  await refreshLiveMarketCache()
  const newEvents: AlertEvent[] = []

  for (const rule of rulesStore) {
    if (rule.status !== "Active") continue
    const market = getCachedMarketAsset(rule.asset.symbol)
    if (!market) continue

    const price = market.price
    let triggered = false
    if (rule.type === "PRICE_ABOVE") triggered = price >= rule.targetValue
    if (rule.type === "PRICE_BELOW") triggered = price <= rule.targetValue

    if (!triggered) continue

    rule.status = "Triggered"
    rule.triggeredAt = new Date().toISOString()

    const event: AlertEvent = {
      id: `evt_${Date.now()}_${rule.id}`,
      alertId: rule.id,
      assetId: rule.assetId,
      asset: rule.asset,
      triggeredAt: rule.triggeredAt,
      priceAtTrigger: price,
      message: `${rule.asset.symbol} ${rule.type === "PRICE_ABOVE" ? "rose above" : "fell below"} ${rule.targetValue} (now ${price.toFixed(2)})`,
    }
    eventsStore = [event, ...eventsStore]
    newEvents.push(event)
  }

  if (newEvents.length > 0) saveEvents()
  return newEvents
}
