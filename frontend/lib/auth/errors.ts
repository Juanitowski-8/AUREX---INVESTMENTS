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

export function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'This email is already registered. Sign in or use another email.'
    }
    if (error.status === 0) {
      return 'Cannot reach the server. Check your connection and try again.'
    }
    return error.message || 'Registration failed. Please try again.'
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export function getAuthFormErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Cannot reach the server. Check your connection and try again.'
    }
    return error.message || fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
