"use client"

import type { RiskLevel } from "@/types"

type RiskScoreGaugeProps = {
  score: number
  level: RiskLevel
}

function scoreColor(score: number): string {
  if (score < 40) return "#00D084"
  if (score < 70) return "#FFB800"
  return "#FF3B30"
}

function levelClass(level: RiskLevel): string {
  if (level === "Low") return "bg-[#00D084]/10 text-[#00D084]"
  if (level === "Moderate") return "bg-[#FFB800]/10 text-[#FFB800]"
  return "bg-[#FF3B30]/10 text-[#FF3B30]"
}

export function RiskScoreGauge({ score, level }: RiskScoreGaugeProps) {
  const color = scoreColor(score)
  const circumference = 2 * Math.PI * 80

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 192 192">
        <circle
          cx="96"
          cy="96"
          r="80"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
        />
        <circle
          cx="96"
          cy="96"
          r="80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold tabular-nums text-white">
          {score}
        </span>
        <span className="text-sm text-[#71717A]">/ 100</span>
        <span
          className={`mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${levelClass(level)}`}
        >
          {level}
        </span>
      </div>
    </div>
  )
}
