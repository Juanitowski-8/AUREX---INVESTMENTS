import { ApiError } from '@/lib/api-client'

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 400) {
      return 'Invalid email or password.'
    }
    if (error.status === 0) {
      return 'Cannot reach the server. Is the backend running on port 8080?'
    }
    return error.message || 'Login failed. Please try again.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
