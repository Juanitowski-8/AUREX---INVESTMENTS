/** Tipos JSON del backend Spring Boot (camelCase vía Jackson). */

export type BackendAssetType = 'CRYPTO' | 'STOCK' | 'ETF' | 'CASH'

export type BackendConditionType = 'ABOVE' | 'BELOW'

export type BackendTransactionType = 'BUY' | 'SELL'

export type BackendRiskLevel = 'Low' | 'Moderate' | 'High'

export interface BackendCurrentUser {
  id: string
  fullName: string
  email: string
  role: string
}

export interface BackendAuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: BackendCurrentUser
}

export interface BackendMarketTicker {
  symbol: string
  name: string
  price: number
  change24h: number
  assetType: BackendAssetType
  source?: string
  updatedAt?: string
  marketCap?: number
  volume24h?: number
}

export interface BackendMarketAsset {
  id: string
  symbol: string
  name: string
  assetType: BackendAssetType
  externalId?: string
  price: number
  change24h: number
  source?: string
  updatedAt?: string
  marketCap?: number
  volume24h?: number
}

export interface BackendMarketHistoryPoint {
  date: string
  price: number
}

export interface BackendPortfolio {
  id: string
  name: string
  baseCurrency: string
  description?: string | null
  createdAt: string
  updatedAt?: string
}

export interface BackendAllocation {
  symbol: string
  value: number
  percentage: number
}

export interface BackendAssetPerformance {
  symbol: string
  pnlPercentage: number
}

export interface BackendPortfolioSummary {
  portfolioId: string
  name: string
  baseCurrency: string
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercentage: number
  bestAsset?: BackendAssetPerformance | null
  worstAsset?: BackendAssetPerformance | null
  riskLevel: string
  allocation: BackendAllocation[]
  updatedAt?: string
}

export interface BackendHolding {
  id: string
  assetSymbol: string
  assetName: string
  assetType: BackendAssetType
  quantity: number
  averageBuyPrice: number
  currentPrice: number
  marketValue: number
  pnl: number
  allocation: number
}

export interface BackendTransaction {
  id: string
  portfolioId: string
  assetSymbol: string
  assetName: string
  type: BackendTransactionType
  quantity: number
  price: number
  transactionDate: string
  notes?: string | null
  createdAt: string
}

export interface BackendAlert {
  id: string
  assetSymbol: string
  assetName: string
  conditionType: BackendConditionType
  targetPrice: number
  enabled: boolean
  createdAt: string
  updatedAt?: string
}

export interface BackendAlertEvent {
  id: string
  alertRuleId: string
  assetSymbol: string
  assetName: string
  triggeredPrice: number
  message?: string | null
  triggeredAt: string
  read: boolean
}

export interface BackendAIAnalysis {
  id: string
  portfolioId: string
  summary: string
  riskLevel: BackendRiskLevel
  concentrationNotes: string
  observations: string[]
  disclaimer: string
  createdAt: string
}
