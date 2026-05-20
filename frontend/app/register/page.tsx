'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { AuthPageLayout, AuthPageShell } from '@/components/auth/auth-page-shell'
import { RegisterForm } from '@/components/auth/register-form'
import { IS_MOCK_MODE } from '@/lib/config'
import { hasAuthToken, requiresAuthentication } from '@/lib/auth/session'

function RegisterPageContent() {
  const router = useRouter()

  useEffect(() => {
    if (!requiresAuthentication()) return
    if (!hasAuthToken()) return
    router.replace('/dashboard')
  }, [router])

  return (
    <AuthPageLayout>
      <AuthPageShell
        title="Create your account"
        subtitle="Join Aurex to track portfolios and AI insights"
        badge={
          IS_MOCK_MODE
            ? 'Mock mode — account is stored locally after sign in'
            : undefined
        }
      >
        <RegisterForm />
      </AuthPageShell>
    </AuthPageLayout>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen message="Loading…" />}>
      <RegisterPageContent />
    </Suspense>
  )
}
