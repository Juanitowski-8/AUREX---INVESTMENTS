import type {
  AlertRule,
  AlertRuleType,
  AlertStatus,
  User,
} from './finance'

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PortfolioSummary {
  portfolioId: string
  totalValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  dailyReturn: number
  monthlyReturn: number
  aiRiskScore: number
  bestAsset: string
  worstAsset: string
}

/** GET /api/portfolios/{id} */
export interface PortfolioDetail {
  id: string
  name: string
  createdAt: string
}

export interface CreateAlertInput {
  assetId: string
  type: AlertRuleType
  targetValue: number
  status?: AlertStatus
}

export type { AlertRule, User }
