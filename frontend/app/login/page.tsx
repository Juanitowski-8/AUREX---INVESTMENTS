'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogoAurex } from '@/components/logo-aurex'
import { LoginForm } from '@/components/auth/login-form'
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen'
import { Card } from '@/components/ui/card'
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
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201, 162, 39, 0.15), transparent)',
        }}
      />
      <motion.div
        className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-[#C9A227]/5 blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex justify-center">
          <LogoAurex size="md" showTagline />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="border-white/10 bg-[#0A0A0A]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                Sign in to your Aurex intelligence terminal
              </p>
              {IS_MOCK_MODE ? (
                <p className="mt-3 rounded-lg border border-[#C9A227]/20 bg-[#C9A227]/5 px-3 py-2 text-xs text-[#C9A227]">
                  Mock mode — any valid email/password works locally
                </p>
              ) : null}
            </div>

            <LoginForm />
          </Card>
        </motion.div>

        <p className="mt-8 text-center text-xs text-[#52525B]">
          Educational platform only. Not financial advice.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen message="Loading sign in…" />}>
      <LoginPageContent />
    </Suspense>
  )
}
