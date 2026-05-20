"use client"

import { useEffect, useState } from "react"
import { getMarketAssets } from "@/services/market.service"
import { motion } from "framer-motion"
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"
import { formatCurrency, formatPercent, formatCompact } from "@/lib/mock-data"
import type { AssetType, MarketAsset } from "@/types"
import { getAssetTypeBadgeClass } from "@/types/finance"
import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts"

const ASSET_FILTER_MAP: Record<string, AssetType | null> = {
  all: null,
  crypto: 'CRYPTO',
  stock: 'STOCK',
  etf: 'ETF',
}

/** Sparkline determinista según cambio 24h (no precio histórico). */
function sparklineFromChange24h(change24h: number) {
  const up = change24h >= 0
  const data: { value: number }[] = []
  let value = 100
  for (let i = 0; i < 20; i++) {
    value += up ? 0.6 + i * 0.05 : -0.6 - i * 0.05
    data.push({ value: Math.max(80, Math.min(120, value)) })
  }
  return data
}

// Featured Asset Card
function FeaturedAssetCard({ 
  asset, 
  delay = 0 
}: { 
  asset: MarketAsset
  delay?: number 
}) {
  const isPositive = asset.change24h >= 0
  const chartData = sparklineFromChange24h(asset.change24h)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden p-5 bg-[#0A0A0A] border-white/5 hover:border-[#C9A227]/30 transition-all group cursor-pointer">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C9A227]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                getAssetTypeBadgeClass(asset.type)
              }`}>
                {asset.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-white">{asset.symbol}</p>
                <p className="text-xs text-[#A1A1AA]">{asset.name}</p>
              </div>
            </div>
          </div>
          
          <div className="h-12 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isPositive ? '#00D084' : '#FF3B30'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-white">{formatCurrency(asset.price)}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              isPositive ? 'bg-[#00D084]/10 text-[#00D084]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatPercent(asset.change24h)}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Market Table Row
function MarketTableRow({ 
  asset, 
  index 
}: { 
  asset: MarketAsset
  index: number 
}) {
  const isPositive = asset.change24h >= 0
  const chartData = sparklineFromChange24h(asset.change24h)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#A1A1AA] w-6">{index + 1}</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
getAssetTypeBadgeClass(asset.type)
          }`}>
            {asset.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-white">{asset.name}</p>
            <p className="text-xs text-[#A1A1AA]">{asset.symbol}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="font-medium text-white">{formatCurrency(asset.price)}</p>
      </td>
      <td className="py-4 px-4">
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
          isPositive ? 'bg-[#00D084]/10 text-[#00D084]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatPercent(asset.change24h)}
        </div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        <p className="text-sm text-[#A1A1AA]">${formatCompact(asset.marketCap)}</p>
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <p className="text-sm text-[#A1A1AA]">${formatCompact(asset.volume24h)}</p>
      </td>
      <td className="py-4 px-4 hidden xl:table-cell">
        <div className="w-24 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? '#00D084' : '#FF3B30'}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </td>
    </motion.tr>
  )
}

export default function MarketsPage() {
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<'all' | 'crypto' | 'stock' | 'etf'>('all')

  useEffect(() => {
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search).get("search")?.trim()
    if (q) setSearchQuery(q)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = () =>
      getMarketAssets().then((list) => {
        if (!cancelled) setAssets(list)
      })
    void load()
    const id = window.setInterval(() => void load(), 45_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      !ASSET_FILTER_MAP[filter] || asset.type === ASSET_FILTER_MAP[filter]
    return matchesSearch && matchesFilter
  })

  // Featured assets (top 4 by market cap)
  const featuredAssets = [...assets]
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, 4)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white sm:text-2xl">Markets</h2>
            <p className="text-sm text-[#A1A1AA]">Track real-time prices and trends</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111] border-white/5 text-white placeholder:text-[#A1A1AA] focus:border-[#C9A227]/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Featured Assets */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Featured Assets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredAssets.map((asset, index) => (
              <FeaturedAssetCard key={asset.id} asset={asset} delay={index * 0.1} />
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { key: 'all', label: 'All Assets' },
            { key: 'crypto', label: 'Crypto' },
            { key: 'stock', label: 'Stocks' },
            { key: 'etf', label: 'ETFs' },
          ].map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={filter === tab.key ? 'default' : 'ghost'}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={filter === tab.key 
                ? 'bg-[#C9A227]/10 text-[#C9A227] hover:bg-[#C9A227]/20 border border-[#C9A227]/20' 
                : 'text-[#A1A1AA] hover:text-white'
              }
            >
              {tab.label}
            </Button>
          ))}
        </motion.div>

        {/* Market Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden border-white/5 bg-[#0A0A0A] p-0">
            <div className="aurex-table-scroll">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#A1A1AA]">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                        Asset
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#A1A1AA]">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                        Price
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#A1A1AA]">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                        24h Change
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#A1A1AA] hidden md:table-cell">
                      Market Cap
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#A1A1AA] hidden lg:table-cell">
                      Volume (24h)
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#A1A1AA] hidden xl:table-cell">
                      Trend (24h)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset, index) => (
                    <MarketTableRow key={asset.id} asset={asset} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAssets.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-[#A1A1AA]">No assets found matching your search.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
