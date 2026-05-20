/** Aurex financial domain types */

export type AssetType = 'CRYPTO' | 'STOCK' | 'ETF' | 'CASH'

export type RiskLevel = 'Low' | 'Moderate' | 'High'

export type AlertStatus = 'Active' | 'Triggered' | 'Disabled'

export type TransactionType = 'BUY' | 'SELL'

export type AlertRuleType = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_CHANGE'

export type UserPlan = 'free' | 'pro' | 'enterprise'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  createdAt: string
  plan: UserPlan
}

export interface Asset {
  id: string
  name: string
  symbol: string
  type: AssetType
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  icon?: string
}

/** Market listing view of an asset */
export type MarketAsset = Asset

export interface MarketTickerItem {
  symbol: string
  price: number
  change24h: number
  positive: boolean
}

export interface Holding {
  id: string
  assetId: string
  asset: Asset
  quantity: number
  avgBuyPrice: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
  allocation: number
  /**
   * Cotización de mercado en vivo usada para valorar y P/L.
   * `null` = no hay precio de mercado (no usar el avg buy como “current” en la UI).
   */
  markPrice?: number | null
}

export interface Portfolio {
  id: string
  name: string
  totalValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  monthlyReturn: number
  holdings: Holding[]
  createdAt: string
}

export interface PortfolioPerformancePoint {
  date: string
  value: number
}

export interface PriceHistoryPoint {
  date: string
  price: number
}

export interface AllocationItem {
  name: string
  value: number
  color?: string
}

export interface AlertRule {
  id: string
  assetId: string
  asset: Asset
  type: AlertRuleType
  targetValue: number
  status: AlertStatus
  createdAt: string
  triggeredAt?: string
}

export interface AlertEvent {
  id: string
  alertRuleId: string
  asset: Asset
  triggeredAt: string
  priceAtTrigger: number
  message?: string
}

export interface AIInsight {
  id: string
  title: string
  content: string
  riskScore: number
  riskLevel: RiskLevel
  recommendations: string[]
  createdAt: string
}

export interface AIReport {
  id: string
  portfolioId: string
  title: string
  summary: string
  riskScore: number
  riskLevel: RiskLevel
  observations: string[]
  createdAt: string
}

export type AdvisoryPriority = 'info' | 'warning' | 'action'

export type AdvisoryCategory =
  | 'concentration'
  | 'risk'
  | 'diversification'
  | 'performance'
  | 'rebalance'

/** Consejo accionable generado por IA tras un análisis de portafolio */
export interface AIAdvisoryAlert {
  id: string
  portfolioId: string
  reportId?: string
  category: AdvisoryCategory
  priority: AdvisoryPriority
  title: string
  message: string
  suggestion: string
  createdAt: string
}

export function advisoryCategoryLabel(category: AdvisoryCategory): string {
  switch (category) {
    case 'concentration':
      return 'Concentration'
    case 'risk':
      return 'Risk'
    case 'diversification':
      return 'Diversification'
    case 'performance':
      return 'Performance'
    case 'rebalance':
      return 'Rebalance'
    default:
      return category
  }
}

export interface Transaction {
  id: string
  portfolioId: string
  assetId: string
  asset: Asset
  type: TransactionType
  quantity: number
  price: number
  total: number
  executedAt: string
}

/** Chart color by asset class */
export function getAssetTypeColor(type: AssetType): string {
  if (type === 'CRYPTO') return '#C9A227'
  if (type === 'STOCK') return '#00D084'
  return '#00B4D8'
}

/** Tailwind badge classes for asset type chips */
export function getAssetTypeBadgeClass(type: AssetType): string {
  if (type === 'CRYPTO') return 'bg-[#C9A227]/10 text-[#C9A227]'
  if (type === 'STOCK') return 'bg-[#00D084]/10 text-[#00D084]'
  return 'bg-[#00B4D8]/10 text-[#00B4D8]'
}

export function alertRuleTypeLabel(type: AlertRuleType): string {
  switch (type) {
    case 'PRICE_ABOVE':
      return 'Price Above'
    case 'PRICE_BELOW':
      return 'Price Below'
    case 'PERCENT_CHANGE':
      return 'Percent Change'
    default:
      return type
  }
}
