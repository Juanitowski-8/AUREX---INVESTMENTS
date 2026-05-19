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
  if (path === '/login' || path.startsWith('/login?')) {
    return '/dashboard'
  }
  return path
}
