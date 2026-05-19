import type {
  AIReport,
  AlertEvent,
  AlertRule,
  AlertRuleType,
  AllocationItem,
  Asset,
  AssetType,
  Holding,
  MarketAsset,
  MarketTickerItem,
  PortfolioPerformancePoint,
  PriceHistoryPoint,
  RiskLevel,
  Transaction,
  User,
  UserPlan,
} from '@/types'
import type { AuthResponse, PortfolioDetail, PortfolioSummary } from '@/types/api'
import { getAssetTypeColor } from '@/types/finance'
import type {
  BackendAIAnalysis,
  BackendAlert,
  BackendAlertEvent,
  BackendAuthResponse,
  BackendCurrentUser,
  BackendHolding,
  BackendMarketAsset,
  BackendMarketHistoryPoint,
  BackendMarketTicker,
  BackendPortfolio,
  BackendPortfolioSummary,
  BackendTransaction,
} from '@/lib/api/backend-types'

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mapAssetType(type: string): AssetType {
  const upper = type.toUpperCase()
  if (upper === 'CRYPTO' || upper === 'STOCK' || upper === 'ETF' || upper === 'CASH') {
    return upper
  }
  return 'STOCK'
}

function riskLevelToScore(level: string): number {
  switch (level) {
    case 'Low':
      return 28
    case 'High':
      return 78
    default:
      return 52
  }
}

function mapAlertCondition(type: string): AlertRuleType {
  return type === 'BELOW' ? 'PRICE_BELOW' : 'PRICE_ABOVE'
}

function mapAlertConditionToBackend(type: AlertRuleType): 'ABOVE' | 'BELOW' {
  return type === 'PRICE_BELOW' ? 'BELOW' : 'ABOVE'
}

export function mapUser(raw: BackendCurrentUser): User {
  const plan: UserPlan =
    raw.role === 'ADMIN' ? 'enterprise' : raw.role === 'USER' ? 'free' : 'free'

  return {
    id: raw.id,
    name: raw.fullName,
    email: raw.email,
    avatar: '',
    createdAt: new Date().toISOString(),
    plan,
  }
}

export function mapAuthResponse(raw: BackendAuthResponse): AuthResponse {
  return {
    token: raw.accessToken,
    user: mapUser(raw.user),
  }
}

export function mapMarketTickerItem(raw: BackendMarketTicker): MarketTickerItem {
  const change24h = toNumber(raw.change24h)
  return {
    symbol: raw.symbol,
    price: toNumber(raw.price),
    change24h,
    positive: change24h >= 0,
  }
}

export function mapMarketAsset(raw: BackendMarketAsset): MarketAsset {
  return {
    id: raw.id,
    name: raw.name,
    symbol: raw.symbol,
    type: mapAssetType(raw.assetType),
    price: toNumber(raw.price),
    change24h: toNumber(raw.change24h),
    marketCap: toNumber(raw.marketCap),
    volume24h: toNumber(raw.volume24h),
  }
}

export function mapAssetFromSymbol(
  symbol: string,
  name: string,
  type: string,
  price = 0
): Asset {
  const assetType = mapAssetType(type)
  return {
    id: symbol,
    name,
    symbol,
    type: assetType,
    price,
    change24h: 0,
    marketCap: 0,
    volume24h: 0,
  }
}

export function mapPriceHistory(
  raw: BackendMarketHistoryPoint[]
): PriceHistoryPoint[] {
  return raw.map((point) => ({
    date: point.date,
    price: toNumber(point.price),
  }))
}

export function mapPortfolioDetail(raw: BackendPortfolio): PortfolioDetail {
  return {
    id: raw.id,
    name: raw.name,
    createdAt: raw.createdAt,
  }
}

export function mapPortfolioSummary(raw: BackendPortfolioSummary): PortfolioSummary {
  return {
    portfolioId: raw.portfolioId,
    totalValue: toNumber(raw.totalValue),
    totalProfitLoss: toNumber(raw.totalPnL),
    totalProfitLossPercent: toNumber(raw.totalPnLPercentage),
    dailyReturn: 0,
    monthlyReturn: 0,
    aiRiskScore: riskLevelToScore(raw.riskLevel),
    bestAsset: raw.bestAsset?.symbol ?? '—',
    worstAsset: raw.worstAsset?.symbol ?? '—',
  }
}

export function mapAllocation(raw: BackendPortfolioSummary): AllocationItem[] {
  return (raw.allocation ?? []).map((item) => ({
    name: item.symbol,
    value: toNumber(item.percentage),
    color: getAssetTypeColor('CRYPTO'),
  }))
}

export function mapHolding(raw: BackendHolding): Holding {
  const asset = mapAssetFromSymbol(
    raw.assetSymbol,
    raw.assetName,
    raw.assetType,
    toNumber(raw.currentPrice)
  )

  const marketValue = toNumber(raw.marketValue)
  const avgBuy = toNumber(raw.averageBuyPrice)
  const qty = toNumber(raw.quantity)
  const cost = avgBuy * qty
  const pnl = toNumber(raw.pnl)

  return {
    id: raw.id,
    assetId: raw.assetSymbol,
    asset,
    quantity: qty,
    avgBuyPrice: avgBuy,
    currentValue: marketValue,
    profitLoss: pnl,
    profitLossPercent: cost > 0 ? (pnl / cost) * 100 : 0,
    allocation: toNumber(raw.allocation),
  }
}

export function mapTransaction(raw: BackendTransaction): Transaction {
  const asset = mapAssetFromSymbol(raw.assetSymbol, raw.assetName, 'CRYPTO', toNumber(raw.price))
  const quantity = toNumber(raw.quantity)
  const price = toNumber(raw.price)

  return {
    id: raw.id,
    portfolioId: raw.portfolioId,
    assetId: raw.assetSymbol,
    asset,
    type: raw.type,
    quantity,
    price,
    total: quantity * price,
    executedAt: raw.transactionDate,
  }
}

export function mapAlertRule(raw: BackendAlert): AlertRule {
  const asset = mapAssetFromSymbol(raw.assetSymbol, raw.assetName, 'CRYPTO')

  return {
    id: raw.id,
    assetId: raw.assetSymbol,
    asset,
    type: mapAlertCondition(raw.conditionType),
    targetValue: toNumber(raw.targetPrice),
    status: raw.enabled ? 'Active' : 'Disabled',
    createdAt: raw.createdAt.split('T')[0] ?? raw.createdAt,
  }
}

export function mapAlertEvent(raw: BackendAlertEvent): AlertEvent {
  return {
    id: raw.id,
    alertRuleId: raw.alertRuleId,
    asset: mapAssetFromSymbol(raw.assetSymbol, raw.assetName, 'CRYPTO', toNumber(raw.triggeredPrice)),
    triggeredAt: raw.triggeredAt,
    priceAtTrigger: toNumber(raw.triggeredPrice),
    message: raw.message ?? undefined,
  }
}

export function mapAIReport(raw: BackendAIAnalysis): AIReport {
  const riskLevel = raw.riskLevel as RiskLevel

  return {
    id: raw.id,
    portfolioId: raw.portfolioId,
    title: 'Portfolio intelligence snapshot',
    summary: raw.summary,
    riskScore: riskLevelToScore(riskLevel),
    riskLevel,
    observations: raw.observations ?? [],
    createdAt: raw.createdAt,
  }
}

/** Convierte formulario de alerta del UI al body del backend. */
export function mapCreateAlertBody(input: {
  assetId: string
  type: AlertRuleType
  targetValue: number
}) {
  return {
    assetSymbol: input.assetId,
    conditionType: mapAlertConditionToBackend(input.type),
    targetPrice: input.targetValue,
  }
}

export function mapCreateTransactionBody(input: {
  portfolioId: string
  assetId: string
  type: Transaction['type']
  quantity: number
  price: number
  transactionDate?: string
  notes?: string
}) {
  return {
    portfolioId: input.portfolioId,
    assetSymbol: input.assetId,
    type: input.type,
    quantity: input.quantity,
    price: input.price,
    transactionDate: input.transactionDate ?? new Date().toISOString(),
    ...(input.notes?.trim() ? { notes: input.notes.trim() } : {}),
  }
}

/** Historial simulado a partir de precio de mercado (sin endpoint de performance). */
export function buildPerformanceFromHistory(
  history: PriceHistoryPoint[],
  totalValue: number
): PortfolioPerformancePoint[] {
  if (history.length === 0) return []

  const lastPrice = history[history.length - 1]!.price
  if (lastPrice <= 0) return []

  const scale = totalValue / lastPrice
  return history.map((point) => ({
    date: point.date,
    value: point.price * scale,
  }))
}
