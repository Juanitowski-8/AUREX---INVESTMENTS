'use client'

import { Suspense } from 'react'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { AuthPageLayout, AuthPageShell } from '@/components/auth/auth-page-shell'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

function ForgotPasswordPageContent() {
  return (
    <AuthPageLayout>
      <AuthPageShell
        title="Forgot password?"
        subtitle="Enter your email and we will help you reset your password"
      >
        <ForgotPasswordForm />
      </AuthPageShell>
    </AuthPageLayout>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen message="Loading…" />}>
      <ForgotPasswordPageContent />
    </Suspense>
  )
}
