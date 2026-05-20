'use client'

import { Loader2 } from 'lucide-react'
import { LogoAurex } from '@/components/logo-aurex'

type AuthLoadingScreenProps = {
  message?: string
}

export function AuthLoadingScreen({
  message = 'Loading your workspace…',
}: AuthLoadingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-4">
      <LogoAurex size="md" showTagline className="mb-8 opacity-90" />
      <Loader2 className="h-8 w-8 animate-spin text-[#C9A227]" aria-hidden />
      <p className="mt-4 text-sm text-[#A1A1AA]">{message}</p>
    </div>
  )
}
