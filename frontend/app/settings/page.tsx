"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User as UserIcon,
  Shield,
  LogOut,
  ChevronRight,
  Globe,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCurrency, type DisplayCurrency } from "@/lib/currency"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { IS_MOCK_MODE } from "@/lib/config"
import { ProfileSettingsForm } from "@/components/auth/profile-settings-form"
import { getCurrentUser, logout } from "@/services/auth.service"
import { useMountedService } from "@/hooks/use-mounted-service"
import type { User } from "@/types"

// Settings Section Component
function SettingsSection({ 
  title, 
  description,
  icon: Icon, 
  children,
  delay = 0
}: { 
  title: string
  description?: string
  icon: React.ElementType
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="border-white/5 bg-[#0A0A0A] p-4 sm:p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2.5 rounded-xl bg-[#C9A227]/10">
            <Icon className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-sm text-[#A1A1AA]">{description}</p>
            )}
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  )
}

// Settings Row Component
function SettingsRow({ 
  label, 
  description,
  children 
}: { 
  label: string
  description?: string
  children: React.ReactNode 
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="text-xs text-[#A1A1AA] mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const initialUser = useMountedService(getCurrentUser, {
    id: '',
    name: '',
    email: '',
    avatar: '',
    createdAt: '',
    plan: 'free',
  } satisfies User)
  const [user, setUser] = useState<User>(initialUser)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  const { currency, setCurrency } = useCurrency()

  return (
    <DashboardLayout>
      <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-white sm:text-2xl">Settings</h2>
          <p className="text-sm text-[#A1A1AA]">Manage your account and preferences</p>
        </motion.div>

        <p className="rounded-lg border border-[#C9A227]/20 bg-[#C9A227]/5 px-4 py-3 text-xs text-[#A1A1AA]">
          Profile and password sync with your account in live mode. Display
          currency converts all USD values across the app instantly.
        </p>

        {/* Profile Section */}
        <div id="profile" className="scroll-mt-24">
        <SettingsSection 
          title="Profile" 
          description="Your personal information"
          icon={UserIcon}
          delay={0.1}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#E8C547] flex items-center justify-center text-white text-xl font-bold">
              {user.name ? user.name.split(' ').map(n => n[0]).join('') : '—'}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user.name || '—'}</p>
              <p className="text-sm text-[#A1A1AA]">{user.email || '—'}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#C9A227]/10 text-[#C9A227]">
                {user.plan.toUpperCase()} Plan
              </span>
            </div>
          </div>
          
          <ProfileSettingsForm
            initialUser={user}
            onSaved={(updated) => setUser(updated)}
          />
        </SettingsSection>
        </div>

        {/* Preferences Section */}
        <SettingsSection 
          title="Preferences" 
          description="Customize your experience"
          icon={Globe}
          delay={0.2}
        >
          <SettingsRow label="Base Currency" description="Currency for portfolio valuation">
            <Select
              value={currency}
              onValueChange={(v) => setCurrency(v as DisplayCurrency)}
            >
              <SelectTrigger className="w-32 bg-[#111] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10">
                <SelectItem value="USD" className="text-white hover:bg-white/5">USD ($)</SelectItem>
                <SelectItem value="EUR" className="text-white hover:bg-white/5">EUR (€)</SelectItem>
                <SelectItem value="GBP" className="text-white hover:bg-white/5">GBP (£)</SelectItem>
                <SelectItem value="JPY" className="text-white hover:bg-white/5">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection 
          title="Security" 
          description="Keep your account secure"
          icon={Shield}
          delay={0.3}
        >
          <SettingsRow label="Change Password" description="Update your password">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white hover:bg-white/5"
              asChild
            >
              <Link href="/forgot-password">
                Change
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </SettingsRow>
          
        </SettingsSection>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 bg-[#0A0A0A] border-[#FF3B30]/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2.5 rounded-xl bg-[#FF3B30]/10">
                <LogOut className="w-5 h-5 text-[#FF3B30]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
                <p className="text-sm text-[#A1A1AA]">Irreversible actions</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Sign Out</p>
                  <p className="text-xs text-[#A1A1AA]">Sign out of your account</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FF3B30]/10"
                  onClick={() => {
                    logout()
                    router.push(IS_MOCK_MODE ? "/" : "/login")
                    router.refresh()
                  }}
                >
                  Sign Out
                </Button>
              </div>
              
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
