'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { sanitizeRedirectPath } from '@/lib/auth/routes'
import { hasAuthToken, requiresAuthentication } from '@/lib/auth/session'
import { getCurrentUser, logout } from '@/services/auth.service'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthGuardProps = {
  children: ReactNode
}

/**
 * En modo `api`, exige JWT válido antes de mostrar rutas internas.
 * En modo `mock`, deja pasar sin redirección.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false

    async function verify() {
      if (!requiresAuthentication()) {
        if (!cancelled) setStatus('authenticated')
        return
      }

      if (!hasAuthToken()) {
        if (!cancelled) setStatus('unauthenticated')
        return
      }

      try {
        await getCurrentUser()
        if (!cancelled) setStatus('authenticated')
      } catch {
        logout()
        if (!cancelled) setStatus('unauthenticated')
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [pathname])

  useEffect(() => {
    if (status !== 'unauthenticated') return

    const redirect = encodeURIComponent(sanitizeRedirectPath(pathname))
    router.replace(`/login?redirect=${redirect}`)
  }, [status, pathname, router])

  if (status === 'loading') {
    return <AuthLoadingScreen message="Verifying session…" />
  }

  if (status === 'unauthenticated') {
    return <AuthLoadingScreen message="Redirecting to sign in…" />
  }

  return <>{children}</>
}
