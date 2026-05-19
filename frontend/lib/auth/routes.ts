/** Rutas que requieren sesión en modo `api`. */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/portfolio',
  '/markets',
  '/alerts',
  '/ai-insights',
  '/settings',
] as const

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/dashboard'
  }
  if (
    path === '/login' ||
    path.startsWith('/login?') ||
    path === '/register' ||
    path.startsWith('/register?') ||
    path === '/forgot-password' ||
    path.startsWith('/forgot-password?') ||
    path === '/reset-password' ||
    path.startsWith('/reset-password?')
  ) {
    return '/dashboard'
  }
  return path
}

export const AUTH_PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const

export function isAuthPublicRoute(pathname: string): boolean {
  return AUTH_PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}?`)
  )
}
