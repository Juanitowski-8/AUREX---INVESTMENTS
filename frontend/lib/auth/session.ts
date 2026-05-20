import { getAuthToken } from '@/lib/api-client'
import { IS_MOCK_MODE } from '@/lib/config'

/** En modo mock no se exige JWT para navegar. */
export function requiresAuthentication(): boolean {
  return !IS_MOCK_MODE
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken())
}

export function isAuthenticated(): boolean {
  if (!requiresAuthentication()) return true
  return hasAuthToken()
}
