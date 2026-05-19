'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { AuthPageLayout, AuthPageShell } from '@/components/auth/auth-page-shell'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

function ResetPasswordPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  return (
    <AuthPageLayout>
      <AuthPageShell
        title="Set a new password"
        subtitle="Choose a strong password for your account"
      >
        <ResetPasswordForm token={token} />
      </AuthPageShell>
    </AuthPageLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen message="Loading…" />}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}
