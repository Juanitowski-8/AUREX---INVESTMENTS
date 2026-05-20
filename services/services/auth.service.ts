import { apiGet, apiPost, setAuthToken, clearAuthToken, AUTH_TOKEN_KEY } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api/config'
import { mockDelay } from '@/lib/api/delay'
import type {
  BackendAuthResponse,
  BackendCurrentUser,
  BackendForgotPasswordResponse,
} from '@/lib/api/backend-types'
import { mapAuthResponse, mapUser } from '@/lib/api/mappers'
import { withDataSource } from '@/lib/api/with-data-source'
import { mockUser } from '@/lib/mock-data'
import type { User } from '@/types'
import type { AuthResponse, LoginInput } from '@/types/api'

export { AUTH_TOKEN_KEY }

export interface RegisterInput {
  fullName: string
  email: string
  password: string
}

function persistToken(token: string): void {
  setAuthToken(token)
}

/** GET /api/auth/me */
export async function getCurrentUser(): Promise<User> {
  return withDataSource(
    async () => {
      await mockDelay()
      return { ...mockUser }
    },
    async () => {
      const user = await apiGet<BackendCurrentUser>(API_ENDPOINTS.auth.me)
      return mapUser(user)
    }
  )
}

/** POST /api/auth/login */
export async function login(input: LoginInput): Promise<AuthResponse> {
  return withDataSource(
    async () => {
      await mockDelay()
      const response: AuthResponse = {
        user: { ...mockUser, email: input.email || mockUser.email },
        token: 'mock_jwt_aurex_dev',
      }
      persistToken(response.token)
      return response
    },
    async () => {
      const raw = await apiPost<BackendAuthResponse>(
        API_ENDPOINTS.auth.login,
        input,
        { auth: false }
      )
      const response = mapAuthResponse(raw)
      persistToken(response.token)
      return response
    }
  )
}

/** POST /api/auth/register */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  return withDataSource(
    async () => {
      await mockDelay()
      const response: AuthResponse = {
        user: {
          ...mockUser,
          name: input.fullName,
          email: input.email,
        },
        token: 'mock_jwt_aurex_dev',
      }
      persistToken(response.token)
      return response
    },
    async () => {
      const raw = await apiPost<BackendAuthResponse>(
        API_ENDPOINTS.auth.register,
        input,
        { auth: false }
      )
      const response = mapAuthResponse(raw)
      persistToken(response.token)
      return response
    }
  )
}

const ACTIVE_PORTFOLIO_KEY = 'aurex_active_portfolio_id'

export interface ForgotPasswordResult {
  message: string
  resetToken: string | null
}

/** POST /api/auth/forgot-password */
export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  return withDataSource(
    async () => {
      await mockDelay()
      return {
        message:
          'Mock mode: use the link below to reset your password (any registered email in API mode).',
        resetToken: 'mock-reset-token',
      }
    },
    async () => {
      const raw = await apiPost<BackendForgotPasswordResponse>(
        API_ENDPOINTS.auth.forgotPassword,
        { email },
        { auth: false }
      )
      return {
        message: raw.message,
        resetToken: raw.resetToken,
      }
    }
  )
}

/** POST /api/auth/reset-password */
export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  return withDataSource(
    async () => {
      await mockDelay()
      if (!token) {
        throw new Error('Reset token is required.')
      }
    },
    async () => {
      await apiPost<void>(
        API_ENDPOINTS.auth.resetPassword,
        { token, password },
        { auth: false }
      )
    }
  )
}

/** Cierra sesión local (borra JWT y caché de portafolio). */
export function logout(): void {
  clearAuthToken()
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ACTIVE_PORTFOLIO_KEY)
  }
}
