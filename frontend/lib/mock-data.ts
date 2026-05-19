// Aurex - Mock Data

import { getAssetTypeColor } from '@/types/finance'
import type {
  AIInsight,
  AIReport,
  AlertEvent,
  AlertRule,
  AllocationItem,
  Asset,
  Holding,
  Portfolio,
  PortfolioPerformancePoint,
  PriceHistoryPoint,
  Transaction,
  User,
} from '@/types'

export type {
  AIInsight,
  AIReport,
  AlertEvent,
  AlertRule,
  AlertRule as Alert,
  AllocationItem,
  Asset,
  Holding,
  MarketAsset,
  MarketTickerItem,
  Portfolio,
  PortfolioPerformancePoint,
  PortfolioPerformancePoint as PortfolioHistory,
  PriceHistoryPoint,
  PriceHistoryPoint as PriceHistory,
  Transaction,
  User,
} from '@/types'

export type {
  AlertRuleType,
  AlertStatus,
  AssetType,
  RiskLevel,
  TransactionType,
} from '@/types/finance'

// Mock User
export const mockUser: User = {
  id: 'usr_001',
  name: 'Alex Morgan',
  email: 'alex@aurex.ai',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  createdAt: '2024-01-15',
  plan: 'pro'
}

// Mock Assets
export const mockAssets: Asset[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'CRYPTO',
    price: 67842.50,
    change24h: 2.34,
    marketCap: 1334000000000,
    volume24h: 28500000000
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'CRYPTO',
    price: 3521.80,
    change24h: -1.12,
    marketCap: 423000000000,
    volume24h: 14200000000
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    type: 'CRYPTO',
    price: 178.45,
    change24h: 5.67,
    marketCap: 82000000000,
    volume24h: 3800000000
  },
  {
    id: 'avax',
    name: 'Avalanche',
    symbol: 'AVAX',
    type: 'CRYPTO',
    price: 42.30,
    change24h: 3.21,
    marketCap: 16500000000,
    volume24h: 890000000
  },
  {
    id: 'ada',
    name: 'Cardano',
    symbol: 'ADA',
    type: 'CRYPTO',
    price: 0.68,
    change24h: -0.89,
    marketCap: 24000000000,
    volume24h: 520000000
  },
  {
    id: 'nvda',
    name: 'NVIDIA',
    symbol: 'NVDA',
    type: 'STOCK',
    price: 875.42,
    change24h: 1.85,
    marketCap: 2156000000000,
    volume24h: 45000000
  },
  {
    id: 'tsla',
    name: 'Tesla',
    symbol: 'TSLA',
    type: 'STOCK',
    price: 248.50,
    change24h: -2.45,
    marketCap: 790000000000,
    volume24h: 98000000
  },
  {
    id: 'aapl',
    name: 'Apple',
    symbol: 'AAPL',
    type: 'STOCK',
    price: 189.72,
    change24h: 0.45,
    marketCap: 2940000000000,
    volume24h: 52000000
  },
  {
    id: 'spy',
    name: 'S&P 500 ETF',
    symbol: 'SPY',
    type: 'ETF',
    price: 524.80,
    change24h: 0.32,
    marketCap: 505000000000,
    volume24h: 68000000
  }
]

// Helper to get asset by ID
export const getAsset = (id: string): Asset | undefined => 
  mockAssets.find(a => a.id === id)

// Mock Holdings
export const mockHoldings: Holding[] = [
  {
    id: 'h1',
    assetId: 'btc',
    asset: mockAssets[0],
    quantity: 0.85,
    avgBuyPrice: 52000,
    currentValue: 57666.13,
    profitLoss: 13466.13,
    profitLossPercent: 30.47,
    allocation: 44.9
  },
  {
    id: 'h2',
    assetId: 'eth',
    asset: mockAssets[1],
    quantity: 5.2,
    avgBuyPrice: 2800,
    currentValue: 18313.36,
    profitLoss: 3753.36,
    profitLossPercent: 25.78,
    allocation: 14.3
  },
  {
    id: 'h3',
    assetId: 'sol',
    asset: mockAssets[2],
    quantity: 45,
    avgBuyPrice: 95,
    currentValue: 8030.25,
    profitLoss: 3755.25,
    profitLossPercent: 87.84,
    allocation: 6.3
  },
  {
    id: 'h4',
    assetId: 'nvda',
    asset: mockAssets[5],
    quantity: 18,
    avgBuyPrice: 620,
    currentValue: 15757.56,
    profitLoss: 4597.56,
    profitLossPercent: 41.19,
    allocation: 12.3
  },
  {
    id: 'h5',
    assetId: 'aapl',
    asset: mockAssets[7],
    quantity: 52,
    avgBuyPrice: 165,
    currentValue: 9865.44,
    profitLoss: 1285.44,
    profitLossPercent: 15.0,
    allocation: 7.7
  },
  {
    id: 'h6',
    assetId: 'tsla',
    asset: mockAssets[6],
    quantity: 25,
    avgBuyPrice: 280,
    currentValue: 6212.50,
    profitLoss: -787.50,
    profitLossPercent: -11.25,
    allocation: 4.8
  },
  {
    id: 'h7',
    assetId: 'spy',
    asset: mockAssets[8],
    quantity: 22,
    avgBuyPrice: 480,
    currentValue: 11545.60,
    profitLoss: 985.60,
    profitLossPercent: 9.33,
    allocation: 9.0
  }
]

// Mock Portfolio
export const mockPortfolio: Portfolio = {
  id: 'portfolio_main',
  name: 'Main Portfolio',
  totalValue: 128450.84,
  totalProfitLoss: 27055.84,
  totalProfitLossPercent: 26.7,
  monthlyReturn: 18.4,
  holdings: mockHoldings,
  createdAt: '2024-01-15'
}

// Mock alert rules
export const mockAlertRules: AlertRule[] = [
  {
    id: 'alert_1',
    assetId: 'btc',
    asset: mockAssets[0],
    type: 'PRICE_ABOVE',
    targetValue: 70000,
    status: 'Active',
    createdAt: '2024-03-10',
  },
  {
    id: 'alert_2',
    assetId: 'eth',
    asset: mockAssets[1],
    type: 'PRICE_BELOW',
    targetValue: 3000,
    status: 'Active',
    createdAt: '2024-03-12',
  },
  {
    id: 'alert_3',
    assetId: 'sol',
    asset: mockAssets[2],
    type: 'PRICE_ABOVE',
    targetValue: 150,
    status: 'Triggered',
    createdAt: '2024-03-05',
    triggeredAt: '2024-03-15',
  },
  {
    id: 'alert_4',
    assetId: 'nvda',
    asset: mockAssets[5],
    type: 'PERCENT_CHANGE',
    targetValue: 10,
    status: 'Disabled',
    createdAt: '2024-02-28',
  },
]

/** @deprecated Use mockAlertRules */
export const mockAlerts = mockAlertRules

export const mockAlertEvents: AlertEvent[] = [
  {
    id: 'event_1',
    alertRuleId: 'alert_3',
    asset: mockAssets[2],
    triggeredAt: '2024-03-15T10:00:00Z',
    priceAtTrigger: 178.45,
    message: 'SOL crossed above $150 target',
  },
]

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight_1',
    title: 'Portfolio Risk Assessment',
    content:
      'Your simulated portfolio shows a blended mix of digital assets and listed equities. Bitcoin represents the largest single position at 44.9% of allocated value, which increases sensitivity to crypto market cycles. Overall risk is assessed as moderate based on concentration and cross-asset correlation patterns.',
    riskScore: 62,
    riskLevel: 'Moderate',
    recommendations: [
      'SOL contributes an outsized share of portfolio volatility (+87.84% unrealized move) relative to its weight',
      'A higher cash or stable-value sleeve could reduce drawdown sensitivity in stress scenarios',
      'TSLA is the only holding with negative unrealized performance — monitor single-name equity risk',
      'NVDA momentum increases growth-factor exposure within the equity sleeve',
    ],
    createdAt: '2024-03-18T10:30:00Z'
  },
  {
    id: 'insight_2',
    title: 'Market Correlation Analysis',
    content:
      'Correlation between crypto holdings and broader market benchmarks has increased in the simulated period. In the current macro backdrop, synchronized moves can amplify systematic risk. Review whether asset classes provide independent risk drivers.',
    riskScore: 58,
    riskLevel: 'Moderate',
    recommendations: [
      'Commodity or defensive ETF sleeves may lower correlation to growth assets',
      'Utilities and healthcare sectors historically exhibit lower beta in risk-off regimes',
      'Macro policy announcements remain a key volatility catalyst for rate-sensitive assets',
    ],
    createdAt: '2024-03-15T14:20:00Z'
  }
]

// Portfolio performance history for charts
export const mockPortfolioHistory: PortfolioPerformancePoint[] = [
  { date: '2024-01-15', value: 101395 },
  { date: '2024-01-22', value: 98200 },
  { date: '2024-01-29', value: 102450 },
  { date: '2024-02-05', value: 105800 },
  { date: '2024-02-12', value: 108920 },
  { date: '2024-02-19', value: 104350 },
  { date: '2024-02-26', value: 112680 },
  { date: '2024-03-04', value: 118450 },
  { date: '2024-03-11', value: 121890 },
  { date: '2024-03-18', value: 128450 }
]

// Bitcoin price history
export const mockBTCHistory: PriceHistoryPoint[] = [
  { date: '2024-01-15', price: 42500 },
  { date: '2024-01-22', price: 40200 },
  { date: '2024-01-29', price: 43100 },
  { date: '2024-02-05', price: 45200 },
  { date: '2024-02-12', price: 48500 },
  { date: '2024-02-19', price: 51200 },
  { date: '2024-02-26', price: 54800 },
  { date: '2024-03-04', price: 61200 },
  { date: '2024-03-11', price: 65400 },
  { date: '2024-03-18', price: 67842 }
]

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    portfolioId: 'portfolio_main',
    assetId: 'btc',
    asset: mockAssets[0],
    type: 'BUY',
    quantity: 0.25,
    price: 61200,
    total: 15300,
    executedAt: '2024-03-01T14:22:00Z',
  },
  {
    id: 'tx_2',
    portfolioId: 'portfolio_main',
    assetId: 'eth',
    asset: mockAssets[1],
    type: 'BUY',
    quantity: 2,
    price: 3200,
    total: 6400,
    executedAt: '2024-02-18T09:15:00Z',
  },
  {
    id: 'tx_3',
    portfolioId: 'portfolio_main',
    assetId: 'nvda',
    asset: mockAssets[5],
    type: 'BUY',
    quantity: 5,
    price: 720,
    total: 3600,
    executedAt: '2024-02-10T16:40:00Z',
  },
  {
    id: 'tx_4',
    portfolioId: 'portfolio_main',
    assetId: 'sol',
    asset: mockAssets[2],
    type: 'SELL',
    quantity: 10,
    price: 165,
    total: 1650,
    executedAt: '2024-01-28T11:05:00Z',
  },
  {
    id: 'tx_5',
    portfolioId: 'portfolio_main',
    assetId: 'tsla',
    asset: mockAssets[6],
    type: 'BUY',
    quantity: 8,
    price: 255,
    total: 2040,
    executedAt: '2024-01-20T13:30:00Z',
  },
]

// AI analysis reports (saved history)
export const mockAIReports: AIReport[] = [
  {
    id: 'report_1',
    portfolioId: 'portfolio_main',
    title: 'Weekly Portfolio Review',
    summary:
      'Portfolio up 18.4% monthly with moderate risk. Crypto allocation remains elevated; equities provide balance.',
    riskScore: 62,
    riskLevel: 'Moderate',
    observations: [
      'BTC concentration at 44.9% of total value',
      'SOL showing strongest relative performance',
      'TSLA is the only holding with negative P/L',
    ],
    createdAt: '2024-03-18T10:30:00Z',
  },
  {
    id: 'report_2',
    portfolioId: 'portfolio_main',
    title: 'Risk & Correlation Snapshot',
    summary:
      'Cross-asset correlation increased week-over-week in the simulated dataset. Defensive sleeves may warrant review from a risk-management perspective.',
    riskScore: 58,
    riskLevel: 'Moderate',
    observations: [
      'Crypto beta to broad market remains high',
      'SPY allocation adds stability',
      'NVDA momentum supports growth sleeve',
    ],
    createdAt: '2024-03-11T08:00:00Z',
  },
]

/** Price history per symbol — scales BTC template for other assets */
export function getMockMarketHistory(symbol: string): PriceHistoryPoint[] {
  const normalized = symbol.toUpperCase()
  if (normalized === 'BTC') return [...mockBTCHistory]

  const asset = mockAssets.find((a) => a.symbol === normalized)
  if (!asset) return []

  const btcLatest = mockBTCHistory[mockBTCHistory.length - 1]?.price ?? 1
  const scale = asset.price / btcLatest

  return mockBTCHistory.map((point) => ({
    date: point.date,
    price: Math.round(point.price * scale * 100) / 100,
  }))
}

// Allocation data for pie chart
export const mockAllocationData: AllocationItem[] = mockHoldings.map((h) => ({
  name: h.asset.symbol,
  value: h.allocation,
  color: getAssetTypeColor(h.asset.type),
}))

// Format helpers
export const formatCurrency = (value: number, compact = false): string => {
  if (compact && Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  }
  if (compact && Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export const formatCompact = (value: number): string => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}
