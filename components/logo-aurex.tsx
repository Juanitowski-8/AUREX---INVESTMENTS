"use client"

import React, { useId } from "react"

interface LogoAurexProps {
  compact?: boolean
  /** Hide tagline line (sidebar / mobile nav) */
  showTagline?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LogoAurex({
  compact = false,
  showTagline = true,
  className = "",
  size = "md",
}: LogoAurexProps) {
  const uid = useId().replace(/:/g, "")
  const g1 = `${uid}-barGold1`
  const g2 = `${uid}-barGold2`
  const g3 = `${uid}-barGold3`
  const g4 = `${uid}-barGold4`

  const sizeConfig = {
    sm: {
      container: "h-10 w-10 rounded-xl",
      iconSize: 40,
      text: "text-xl",
      tagline: "text-[0.5rem]",
      gap: "gap-2.5",
    },
    md: {
      container: "h-12 w-12 rounded-xl",
      iconSize: 48,
      text: "text-[1.6rem]",
      tagline: "text-[0.58rem]",
      gap: "gap-3",
    },
    lg: {
      container: "h-14 w-14 rounded-2xl",
      iconSize: 56,
      text: "text-[1.8rem]",
      tagline: "text-[0.62rem]",
      gap: "gap-3.5",
    },
  }

  const s = sizeConfig[size]

  return (
    <div
      className={`flex min-w-0 max-w-full items-center ${s.gap} ${className}`}
      aria-label="Aurex"
    >
      <div
        className={`logo-icon relative flex shrink-0 items-center justify-center ${s.container} bg-[#0A0A0B] shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.08]`}
      >
        <svg
          width={s.iconSize * 0.55}
          height={s.iconSize * 0.55}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id={g1} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8C547" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#C9A227" />
            </linearGradient>
            <linearGradient id={g2} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8C547" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8921F" />
            </linearGradient>
            <linearGradient id={g3} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0D878" />
              <stop offset="50%" stopColor="#E8C547" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            <linearGradient id={g4} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5E6A8" />
              <stop offset="40%" stopColor="#E8C547" />
              <stop offset="100%" stopColor="#C9A227" />
            </linearGradient>
          </defs>
          <path d="M3 26V18L6.5 17V26H3Z" fill={`url(#${g1})`} />
          <path d="M9.5 26V14L13 12.5V26H9.5Z" fill={`url(#${g2})`} />
          <path d="M16 26V10L19.5 8V26H16Z" fill={`url(#${g3})`} />
          <path d="M22.5 26V6L26 4V26H22.5Z" fill={`url(#${g4})`} />
        </svg>
      </div>

      {!compact && (
        <div className="flex min-w-0 flex-col leading-none">
          <span className={`font-semibold tracking-[0.12em] ${s.text} text-[#F5F0E5]`}>
            AUREX
          </span>
          {showTagline && (
            <span
              className={`mt-1 hidden uppercase tracking-[0.2em] text-[#8A8478] sm:inline ${s.tagline}`}
            >
              AI-Powered Portfolio Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** Standalone icon for favicons and static assets */
export function AurexIcon({
  className = "",
  size = 32,
}: {
  className?: string
  size?: number
}) {
  const uid = useId().replace(/:/g, "")
  const g1 = `${uid}-i1`
  const g2 = `${uid}-i2`
  const g3 = `${uid}-i3`
  const g4 = `${uid}-i4`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={g1} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C547" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
        <linearGradient id={g2} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C547" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8921F" />
        </linearGradient>
        <linearGradient id={g3} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0D878" />
          <stop offset="50%" stopColor="#E8C547" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id={g4} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5E6A8" />
          <stop offset="40%" stopColor="#E8C547" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0A0A0B" />
      <path d="M14 48V36L20 34V48H14Z" fill={`url(#${g1})`} />
      <path d="M23 48V28L29 25V48H23Z" fill={`url(#${g2})`} />
      <path d="M32 48V20L38 16V48H32Z" fill={`url(#${g3})`} />
      <path d="M41 48V12L47 8V48H41Z" fill={`url(#${g4})`} />
    </svg>
  )
}
