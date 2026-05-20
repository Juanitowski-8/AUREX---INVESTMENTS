"use client"

import { motion } from "framer-motion"
import { Crosshair, Gem, LineChart, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

const PILLARS = [
  {
    icon: Gem,
    title: "Meaning",
    text: "Inspired by value, precision and the symbolic strength of gold.",
  },
  {
    icon: Sparkles,
    title: "Vision",
    text: "Transform complex financial data into clear AI-powered insights.",
  },
  {
    icon: Crosshair,
    title: "Focus",
    text: "Simulated portfolios, crypto and stock assets, risk exposure, allocation, alerts and educational analysis.",
  },
] as const

export function MeaningVisionSection() {
  return (
    <section
      id="meaning-vision"
      className="relative z-10 border-t border-white/[0.06] bg-[#060606]/80 py-24 px-6"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/25 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-3xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-[#C9A227]" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
              Aurex
            </span>
          </div>
          <h2 className="mb-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Meaning &amp; Vision
          </h2>
          <p className="text-base leading-relaxed text-[#A1A1AA] md:text-lg">
            Aurex combines the symbolism of value, precision and financial clarity
            with AI-powered market intelligence. Built for modern investors,
            students and analysts, Aurex transforms portfolio data into clear
            insights, elegant visualizations and educational financial analysis.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="h-full border-white/[0.06] bg-[#0A0A0A]/90 p-6 transition-colors hover:border-[#C9A227]/20">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#C9A227]/15 bg-[#C9A227]/[0.07]">
                  <pillar.icon className="h-5 w-5 text-[#C9A227]" aria-hidden />
                </div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#A1A1AA]">
                  {pillar.text}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
