/**
 * Rutas relativas del API Spring Boot (prefijo `/api` ya está en `API_BASE_URL`).
 */
export { API_BASE_URL, DATA_MODE, IS_MOCK_MODE, USE_MOCK_API } from '@/lib/config'

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  market: {
    ticker: '/market/ticker',
    assets: '/market/assets',
    history: (symbol: string) => `/market/history/${encodeURIComponent(symbol)}`,
  },
  /** Catálogo de activos (AssetController — distinto de market/assets). */
  assets: {
    list: '/assets',
    search: '/assets/search',
    detail: (symbol: string) => `/assets/${encodeURIComponent(symbol)}`,
  },
  portfolios: {
    list: '/portfolios',
    detail: (id: string) => `/portfolios/${id}`,
    summary: (id: string) => `/portfolios/${id}/summary`,
    holdings: (id: string) => `/portfolios/${id}/holdings`,
  },
  transactions: {
    list: '/transactions',
    create: '/transactions',
    delete: (id: string) => `/transactions/${id}`,
  },
  alerts: {
    list: '/alerts',
    events: '/alerts/events',
    detail: (id: string) => `/alerts/${id}`,
    toggle: (id: string) => `/alerts/${id}/toggle`,
  },
  ai: {
    portfolioSummary: (portfolioId: string) =>
      `/ai/portfolio-summary/${portfolioId}`,
    analyses: '/ai/analyses',
    analysis: (id: string) => `/ai/analyses/${id}`,
  },
} as const
