'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogoAurex } from '@/components/logo-aurex'
import { Card } from '@/components/ui/card'

type AuthPageShellProps = {
  title: string
  subtitle: string
  badge?: string
  children: React.ReactNode
}

export function AuthPageShell({
  title,
  subtitle,
  badge,
  children,
}: AuthPageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="border-white/10 bg-[#0A0A0A]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur sm:p-8">
        <motion.div layout className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">{subtitle}</p>
          {badge ? (
            <p className="mt-3 rounded-lg border border-[#C9A227]/20 bg-[#C9A227]/5 px-3 py-2 text-xs text-[#C9A227]">
              {badge}
            </p>
          ) : null}
        </motion.div>
        {children}
      </Card>
    </motion.div>
  )
}

export function AuthPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div layout className="relative min-h-screen overflow-hidden bg-[#050505]">
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
        {children}
        <p className="mt-8 text-center text-xs text-[#52525B]">
          Educational platform only. Not financial advice.
        </p>
      </div>
    </motion.div>
  )
}
