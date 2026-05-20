"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, TrendingUp, TrendingDown, Wallet, BarChart3, Brain, Zap, Shield, Eye } from "lucide-react"
import { LogoAurex } from "@/components/logo-aurex"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatPercent, formatCompact } from "@/lib/mock-data"
import { MarketTicker } from "@/components/landing/MarketTicker"
import { EducationalDisclaimer } from "@/components/landing/EducationalDisclaimer"
import { HeroMetricsStrip } from "@/components/landing/HeroMetricsStrip"
import { MeaningVisionSection } from "@/components/landing/MeaningVisionSection"
import { getMarketTicker } from "@/services/market.service"
import { getPortfolioHoldings, getPortfolioSummary } from "@/services/portfolio.service"
import type { Holding, MarketTickerItem } from "@/types"
import type { PortfolioSummary } from "@/types/api"

// Mini candlestick data for visual effect
const candleData = [
  { o: 45, h: 52, l: 42, c: 50 },
  { o: 50, h: 55, l: 48, c: 48 },
  { o: 48, h: 58, l: 46, c: 56 },
  { o: 56, h: 60, l: 52, c: 54 },
  { o: 54, h: 62, l: 50, c: 60 },
  { o: 60, h: 65, l: 58, c: 58 },
  { o: 58, h: 68, l: 55, c: 66 },
  { o: 66, h: 70, l: 62, c: 68 },
  { o: 68, h: 72, l: 64, c: 70 },
  { o: 70, h: 78, l: 68, c: 76 },
]

// Mini candlestick chart component
function MiniCandlestick({ data, width = 120, height = 60 }: { data: typeof candleData, width?: number, height?: number }) {
  const maxPrice = Math.max(...data.map(d => d.h))
  const minPrice = Math.min(...data.map(d => d.l))
  const range = maxPrice - minPrice
  const candleWidth = width / data.length - 2
  
  const scale = (price: number) => height - ((price - minPrice) / range) * height
  
  return (
    <svg width={width} height={height} className="opacity-60">
      {data.map((candle, i) => {
        const x = i * (candleWidth + 2) + 1
        const isGreen = candle.c >= candle.o
        const bodyTop = scale(Math.max(candle.o, candle.c))
        const bodyBottom = scale(Math.min(candle.o, candle.c))
        const wickTop = scale(candle.h)
        const wickBottom = scale(candle.l)
        
        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={x + candleWidth / 2}
              y1={wickTop}
              x2={x + candleWidth / 2}
              y2={wickBottom}
              stroke={isGreen ? "#00D084" : "#FF3B30"}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={x}
              y={bodyTop}
              width={candleWidth}
              height={Math.max(bodyBottom - bodyTop, 1)}
              fill={isGreen ? "#00D084" : "#FF3B30"}
              rx={1}
            />
          </g>
        )
      })}
    </svg>
  )
}

// Mini line chart for price visualization
function MiniLineChart({ positive = true }: { positive?: boolean }) {
  const points = positive 
    ? "0,30 15,28 30,25 45,22 60,20 75,15 90,18 105,12 120,8"
    : "0,10 15,12 30,18 45,15 60,22 75,20 90,25 105,28 120,30"
  
  return (
    <svg width="120" height="40" className="opacity-70">
      <defs>
        <linearGradient id={`gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? "#00D084" : "#FF3B30"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? "#00D084" : "#FF3B30"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M${points} L120,40 L0,40 Z`}
        fill={`url(#gradient-${positive ? 'up' : 'down'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#00D084" : "#FF3B30"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Floating asset card
function FloatingAssetCard({ 
  symbol, 
  price, 
  change, 
  delay = 0,
  position 
}: { 
  symbol: string
  price: number
  change: number
  delay?: number
  position: { top?: string, bottom?: string, left?: string, right?: string }
}) {
  return (
    <motion.div
      className="absolute z-20"
      style={position}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-white">{symbol}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${change >= 0 ? 'bg-[#00D084]/20 text-[#00D084]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        </div>
        <p className="text-sm font-semibold text-white">{formatCurrency(price)}</p>
        <MiniLineChart positive={change >= 0} />
      </motion.div>
    </motion.div>
  )
}

function riskLabelFromScore(score: number): string {
  if (score < 40) return "Low"
  if (score < 70) return "Moderate"
  return "High"
}

// Premium portfolio card for hero
function PortfolioCard({
  summary,
  assetCount,
  exposurePercent,
}: {
  summary: PortfolioSummary
  assetCount: number
  exposurePercent: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/20 to-[#00D084]/20 rounded-2xl blur-2xl" />
      <Card className="relative w-full max-w-[340px] rounded-2xl border-white/10 bg-[#0A0A0A]/90 p-5 backdrop-blur-xl sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#E8C547] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Portfolio Value</span>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#00D084]/20 text-[#00D084] font-medium">LIVE</span>
        </div>
        
        {/* Main value */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.totalValue)}</p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium flex items-center gap-1 ${summary.totalProfitLoss >= 0 ? 'text-[#00D084]' : 'text-[#FF3B30]'}`}>
              {summary.totalProfitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {summary.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalProfitLoss)}
            </span>
            <span className="text-xs text-[#A1A1AA]">({formatPercent(summary.monthlyReturn)} this month)</span>
          </div>
        </div>
        
        {/* Mini candlestick chart */}
        <div className="mb-6 p-3 bg-[#111] rounded-lg border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">30D Performance</span>
            <span className={`text-[10px] ${summary.monthlyReturn >= 0 ? 'text-[#00D084]' : 'text-[#FF3B30]'}`}>
              {formatPercent(summary.monthlyReturn)}
            </span>
          </div>
          <MiniCandlestick data={candleData} width={280} height={60} />
        </div>
        
        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-[#111] rounded-lg border border-white/5">
            <p className="text-[10px] text-[#A1A1AA] mb-1">Risk Score</p>
            <p className="text-sm font-semibold text-[#F5A623]">{riskLabelFromScore(summary.aiRiskScore)}</p>
          </div>
          <div className="text-center p-2 bg-[#111] rounded-lg border border-white/5">
            <p className="text-[10px] text-[#A1A1AA] mb-1">Exposure</p>
            <p className="text-sm font-semibold text-white">{exposurePercent}%</p>
          </div>
          <div className="text-center p-2 bg-[#111] rounded-lg border border-white/5">
            <p className="text-[10px] text-[#A1A1AA] mb-1">Assets</p>
            <p className="text-sm font-semibold text-white">{assetCount}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Animated background with financial grid
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0A0A0A] to-[#050505]" />
      
      {/* Financial grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 h-[min(500px,90vw)] w-[min(500px,90vw)] max-w-[100vw] rounded-full bg-gradient-to-br from-[#C9A227]/15 to-transparent blur-[100px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-0 h-[min(600px,95vw)] w-[min(600px,95vw)] max-w-[100vw] rounded-full bg-gradient-to-bl from-[#00D084]/10 to-transparent blur-[120px]"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Subtle price lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <motion.path
          d="M0,400 Q200,350 400,380 T800,320 T1200,360 T1600,300 T2000,340"
          fill="none"
          stroke="#00D084"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
        />
        <motion.path
          d="M0,500 Q300,480 600,520 T1200,450 T1800,500"
          fill="none"
          stroke="#C9A227"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.5, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#050505_70%)]" />
    </div>
  )
}

// Feature card
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  metric,
  metricLabel,
  delay = 0
}: { 
  icon: React.ElementType
  title: string
  description: string
  metric?: string
  metricLabel?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="group relative h-full p-6 bg-[#0A0A0A] border-white/5 hover:border-[#C9A227]/30 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/5 flex items-center justify-center group-hover:border-[#C9A227]/30 transition-colors">
              <Icon className="w-6 h-6 text-[#C9A227]" />
            </div>
            {metric && (
              <div className="text-right">
                <p className="text-lg font-bold text-white">{metric}</p>
                <p className="text-[10px] text-[#A1A1AA]">{metricLabel}</p>
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{description}</p>
        </div>
      </Card>
    </motion.div>
  )
}

// Stats section with trading data
function StatsSection({
  summary,
  winRate,
  exposurePercent,
}: {
  summary: PortfolioSummary
  winRate: number
  exposurePercent: number
}) {
  const stats = [
    {
      label: "Portfolio Value",
      value: formatCompact(summary.totalValue),
      change: formatPercent(summary.monthlyReturn),
      positive: summary.monthlyReturn >= 0,
    },
    {
      label: "Monthly P/L",
      value: `${summary.totalProfitLoss >= 0 ? '+' : ''}${formatCompact(Math.abs(summary.totalProfitLoss))}`,
      change: formatPercent(summary.totalProfitLossPercent),
      positive: summary.totalProfitLoss >= 0,
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      change: formatPercent(summary.monthlyReturn),
      positive: winRate >= 50,
    },
    {
      label: "Market Exposure",
      value: `${exposurePercent}%`,
      change: exposurePercent >= 70 ? "High" : "Balanced",
      positive: exposurePercent <= 85,
    },
  ]

  return (
    <section className="relative z-10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:text-left"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
            Simulated portfolio
          </p>
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Performance at a glance
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[#A1A1AA]">
            Educational metrics from your demo portfolio — crypto, equities and ETFs in one view.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-[#0A0A0A] rounded-2xl border border-white/5"
            >
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-[#A1A1AA] mb-2">{stat.label}</p>
              <span className={`text-xs font-medium ${stat.positive ? 'text-[#00D084]' : 'text-[#FF3B30]'}`}>
                {stat.change}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Holdings preview table
function HoldingsPreview({ holdings }: { holdings: Holding[] }) {
  const preview = holdings.slice(0, 4)

  if (preview.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden"
    >
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Top Holdings</h3>
          <span className="text-xs text-[#A1A1AA]">{preview.length} of {holdings.length} assets</span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {preview.map((holding) => (
          <div key={holding.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#111] border border-white/5 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{holding.asset.symbol.slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{holding.asset.symbol}</p>
                <p className="text-xs text-[#A1A1AA]">{holding.allocation.toFixed(1)}% allocation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{formatCurrency(holding.currentValue)}</p>
              <p className={`text-xs ${holding.profitLossPercent >= 0 ? 'text-[#00D084]' : 'text-[#FF3B30]'}`}>
                {formatPercent(holding.profitLossPercent)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [ticker, setTicker] = useState<MarketTickerItem[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])

  useEffect(() => {
    Promise.all([
      getMarketTicker(),
      getPortfolioSummary(),
      getPortfolioHoldings(),
    ]).then(([tickerData, summaryData, holdingsData]) => {
      setTicker(tickerData)
      setSummary(summaryData)
      setHoldings(holdingsData)
    })
  }, [])

  const exposurePercent = Math.round(
    holdings.reduce((sum, h) => sum + h.allocation, 0)
  )
  const winRate =
    holdings.length > 0
      ? (holdings.filter((h) => h.profitLossPercent >= 0).length / holdings.length) * 100
      : 0

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#050505] text-white">
      <AnimatedBackground />
      
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 px-4 py-3 sm:px-6 sm:py-4"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 shrink-0 items-center">
            <LogoAurex
              size="sm"
              showTagline={false}
              className="md:hidden"
            />
            <LogoAurex
              size="md"
              showTagline={true}
              className="hidden md:flex"
            />
          </Link>
          
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">Dashboard</Link>
            <Link href="/markets" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">Markets</Link>
            <Link href="/portfolio" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">Portfolio</Link>
            <Link href="/ai-insights" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">AI Insights</Link>
            <Link href="/alerts" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">Alerts</Link>
          </div>
          
          {/* CTA */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/register" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-[#A1A1AA] hover:text-white">
                Create account
              </Button>
            </Link>
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-[#A1A1AA] hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-[#C9A227] px-2.5 text-xs hover:bg-[#C9A227]/90 text-white sm:px-4 sm:text-sm">
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Launch Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>
      
      {/* Market Ticker */}
      <MarketTicker items={ticker} />
      
      {/* Hero Section */}
      <section className="relative z-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 md:pb-24 md:pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left - Content */}
            <div className="min-w-0 space-y-6 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-3 text-sm font-medium tracking-tight text-[#C9A227]">
                  Aurex — AI-Powered Portfolio Intelligence
                </p>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D084] animate-pulse" />
                  Simulated markets · Educational use
                </span>

                <h1 className="break-words text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.35rem]">
                  Premium portfolio intelligence for{" "}
                  <span className="gradient-text">modern markets</span>.
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="max-w-xl text-base leading-relaxed text-[#A1A1AA] sm:text-lg"
              >
                Track simulated investments, monitor crypto and stock assets, analyze
                portfolio performance, measure risk exposure, and generate AI-powered
                financial insights from one premium dashboard.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
              >
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="glow-gold h-12 w-full bg-[#C9A227] px-8 text-base font-semibold text-white hover:bg-[#C9A227]/90 sm:w-auto">
                    Launch Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/markets" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-12 w-full border-white/10 px-8 text-base text-white hover:bg-white/5 sm:w-auto">
                    Explore Markets
                  </Button>
                </Link>
              </motion.div>

              {summary && (
                <HeroMetricsStrip
                  summary={summary}
                  assetCount={holdings.length}
                  exposurePercent={exposurePercent}
                  winRate={winRate}
                />
              )}

              {/* Quick metrics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-6 pt-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00D084]" />
                  <span className="text-sm text-[#A1A1AA]">Crypto &amp; equities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
                  <span className="text-sm text-[#A1A1AA]">Risk &amp; allocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
                  <span className="text-sm text-[#A1A1AA]">AI insights</span>
                </div>
              </motion.div>
            </div>
            
            {/* Right - Portfolio Card with floating elements */}
            <div className="hidden lg:block relative h-[500px]">
              {/* Floating asset cards */}
              {ticker[0] && (
                <FloatingAssetCard
                  symbol={ticker[0].symbol}
                  price={ticker[0].price}
                  change={ticker[0].change24h}
                  delay={0.4}
                  position={{ top: "5%", left: "0%" }}
                />
              )}
              {ticker[1] && (
                <FloatingAssetCard
                  symbol={ticker[1].symbol}
                  price={ticker[1].price}
                  change={ticker[1].change24h}
                  delay={0.6}
                  position={{ top: "20%", right: "5%" }}
                />
              )}
              {ticker[2] && (
                <FloatingAssetCard
                  symbol={ticker[2].symbol}
                  price={ticker[2].price}
                  change={ticker[2].change24h}
                  delay={0.8}
                  position={{ bottom: "15%", left: "5%" }}
                />
              )}

              {summary && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <PortfolioCard
                    summary={summary}
                    assetCount={holdings.length}
                    exposurePercent={exposurePercent}
                  />
                </div>
              )}
            </div>
          </div>

          {summary && (
            <motion.div className="mt-10 flex w-full justify-center px-2 lg:hidden">
              <PortfolioCard
                summary={summary}
                assetCount={holdings.length}
                exposurePercent={exposurePercent}
              />
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Stats Section */}
      {summary && (
        <StatsSection
          summary={summary}
          winRate={winRate}
          exposurePercent={exposurePercent}
        />
      )}
      
      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for
              <br />
              <span className="gradient-text">modern investors</span>
            </h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto">
              Simulated portfolios, live-style market data, allocation views, alerts and AI analysis — in one premium workspace.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={BarChart3}
              title="Portfolio Analytics"
              description="Track holdings with real-time valuations, P/L calculations, and allocation breakdowns across crypto and traditional assets."
              metric="+18.4%"
              metricLabel="Monthly return"
              delay={0}
            />
            <FeatureCard
              icon={Brain}
              title="AI Risk Assessment"
              description="Get intelligent risk scores, concentration analysis, and diversification recommendations powered by machine learning."
              metric="Moderate"
              metricLabel="Current risk"
              delay={0.1}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Market Tracking"
              description="Monitor BTC, ETH, SOL, AAPL, NVDA, TSLA, SPY and 1000+ more assets with real-time price data and trends."
              metric="1,200+"
              metricLabel="Assets tracked"
              delay={0.2}
            />
            <FeatureCard
              icon={Shield}
              title="Volatility Analysis"
              description="Understand market exposure and volatility metrics to better manage your investment risk profile."
              metric="24.5%"
              metricLabel="30D volatility"
              delay={0.3}
            />
            <FeatureCard
              icon={Zap}
              title="Price Alerts"
              description="Set custom alerts for any asset and get notified instantly when your price targets are reached."
              metric="12"
              metricLabel="Active alerts"
              delay={0.4}
            />
            <FeatureCard
              icon={Eye}
              title="Performance Reports"
              description="Generate detailed reports on portfolio performance, asset allocation, and investment history."
              metric="Weekly"
              metricLabel="Auto reports"
              delay={0.5}
            />
          </div>
        </div>
      </section>
      
      {/* Holdings Preview Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Track every asset in
                <br />
                <span className="gradient-text">one dashboard</span>
              </h2>
              <p className="text-[#A1A1AA] mb-6">
                From Bitcoin to blue chips, manage your entire portfolio with professional-grade analytics and real-time tracking.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9A227]/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#C9A227]" />
                  </div>
                  <span className="text-sm text-white">Real-time profit/loss tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00D084]/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[#00D084]" />
                  </div>
                  <span className="text-sm text-white">Allocation percentage breakdown</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-[#F5A623]" />
                  </div>
                  <span className="text-sm text-white">AI-powered insights and recommendations</span>
                </div>
              </div>
            </motion.div>
            
            {holdings.length > 0 && <HoldingsPreview holdings={holdings} />}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden p-12 bg-gradient-to-br from-[#111] to-[#0A0A0A] border-white/5">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D084]/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Start building your
                  <br />
                  <span className="gradient-text">investment edge</span>
                </h3>
                <p className="text-[#A1A1AA] mb-8 max-w-xl mx-auto">
                  Join thousands of investors using Aurex to track, analyze, and optimize their portfolios with AI-powered intelligence.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-white px-10 h-14 text-lg font-semibold glow-gold">
                    Launch Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <MeaningVisionSection />

      <EducationalDisclaimer />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <LogoAurex size="sm" />
          <EducationalDisclaimer variant="footer" />
          <p className="text-xs text-[#71717A]">© {new Date().getFullYear()} Aurex</p>
        </div>
      </footer>
    </div>
  )
}


