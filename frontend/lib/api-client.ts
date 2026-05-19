import { API_BASE_URL } from '@/lib/config'

export const AUTH_TOKEN_KEY = 'aurex_token'

/** Respuesta envoltorio del backend Spring Boot */
export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string | null
  timestamp?: string
}

/** Error HTTP del API */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export type ApiRequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
  /** Si false, no adjunta Authorization (p. ej. register/login). */
  auth?: boolean
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true
  if (error instanceof ApiError) return error.status === 0
  return false
}

function buildUrl(path: string, params?: ApiRequestOptions['params']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE_URL}${normalizedPath}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
    if (typeof record.error === 'string') return record.error
  }
  return fallback
}

/**
 * Cliente HTTP para Spring Boot.
 * - Resuelve `API_BASE_URL`
 * - Adjunta `Authorization: Bearer` si hay token
 * - Desenvuelve `{ success, data }`
 */
export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, headers, auth = true, ...init } = options
  const url = buildUrl(path, params)

  const token = auth ? getAuthToken() : null

  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Comprueba que el backend esté en ejecución.',
      0
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  let body: unknown
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    try {
      body = await response.json()
    } catch {
      body = undefined
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearAuthToken()
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        const isAuthPage =
          path.startsWith('/login') ||
          path.startsWith('/register') ||
          path.startsWith('/forgot-password') ||
          path.startsWith('/reset-password')
        if (!isAuthPage && path !== '/') {
          const redirect = encodeURIComponent(path)
          window.location.assign(`/login?redirect=${redirect}`)
        }
      }
    }
    const apiBody = body as { code?: string; message?: string } | undefined
    throw new ApiError(
      extractErrorMessage(body, response.statusText || 'Request failed'),
      response.status,
      apiBody?.code,
      body
    )
  }

  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    const envelope = body as ApiEnvelope<T>
    if (envelope.success === false) {
      throw new ApiError(
        envelope.message ?? 'API request failed',
        response.status,
        undefined,
        body
      )
    }
    return envelope.data
  }

  return body as T
}

export function apiGet<T>(
  path: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(path, { ...options, method: 'GET' })
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(path, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function apiPut<T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(path, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(path, {
    ...options,
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function apiDelete<T>(
  path: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(path, { ...options, method: 'DELETE' })
}
