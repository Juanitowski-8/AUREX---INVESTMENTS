'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { AuthPageLayout, AuthPageShell } from '@/components/auth/auth-page-shell'
import { LoginForm } from '@/components/auth/login-form'
import { sanitizeRedirectPath } from '@/lib/auth/routes'
import { hasAuthToken, requiresAuthentication } from '@/lib/auth/session'
import { IS_MOCK_MODE } from '@/lib/config'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!requiresAuthentication()) return
    if (!hasAuthToken()) return

    const redirect = sanitizeRedirectPath(searchParams.get('redirect'))
    router.replace(redirect)
  }, [router, searchParams])

  return (
    <AuthPageLayout>
      <AuthPageShell
        title="Welcome back"
        subtitle="Sign in to your Aurex intelligence terminal"
        badge={
          IS_MOCK_MODE
            ? 'Mock mode — any valid email/password works locally'
            : undefined
        }
      >
        <LoginForm />
      </AuthPageShell>
    </AuthPageLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen message="Loading sign in…" />}>
      <LoginPageContent />
    </Suspense>
  )
}
