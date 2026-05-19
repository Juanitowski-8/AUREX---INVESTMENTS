"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User as UserIcon,
  DollarSign,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Globe,
  Mail
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { IS_MOCK_MODE } from "@/lib/config"
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
  const user = useMountedService(getCurrentUser, {
    id: '',
    name: '',
    email: '',
    avatar: '',
    createdAt: '',
    plan: 'free',
  } satisfies User)

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    priceAlerts: true,
    aiInsights: false,
    weeklyReport: true
  })
  
  const [currency, setCurrency] = useState("USD")
  const [theme, setTheme] = useState("dark")

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

        {/* Profile Section */}
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
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#A1A1AA]">Full Name</label>
              <Input 
                defaultValue={user.name}
                className="bg-[#111] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#A1A1AA]">Email Address</label>
              <Input 
                defaultValue={user.email}
                type="email"
                className="bg-[#111] border-white/10 text-white"
              />
            </div>
            <Button className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-white">
              Save Changes
            </Button>
          </div>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection 
          title="Preferences" 
          description="Customize your experience"
          icon={Globe}
          delay={0.2}
        >
          <SettingsRow label="Base Currency" description="Currency for portfolio valuation">
            <Select value={currency} onValueChange={setCurrency}>
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
          
          <SettingsRow label="Theme" description="Choose your preferred theme">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32 bg-[#111] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10">
                <SelectItem value="dark" className="text-white hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="light" className="text-white hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection 
          title="Notifications" 
          description="Manage how you receive updates"
          icon={Bell}
          delay={0.3}
        >
          <SettingsRow label="Email Notifications" description="Receive updates via email">
            <Switch 
              checked={notifications.email}
              onCheckedChange={(v) => setNotifications({...notifications, email: v})}
            />
          </SettingsRow>
          
          <SettingsRow label="Push Notifications" description="Browser notifications">
            <Switch 
              checked={notifications.push}
              onCheckedChange={(v) => setNotifications({...notifications, push: v})}
            />
          </SettingsRow>
          
          <SettingsRow label="Price Alerts" description="Get notified when alerts trigger">
            <Switch 
              checked={notifications.priceAlerts}
              onCheckedChange={(v) => setNotifications({...notifications, priceAlerts: v})}
            />
          </SettingsRow>
          
          <SettingsRow label="AI Insights" description="New AI analysis notifications">
            <Switch 
              checked={notifications.aiInsights}
              onCheckedChange={(v) => setNotifications({...notifications, aiInsights: v})}
            />
          </SettingsRow>
          
          <SettingsRow label="Weekly Report" description="Portfolio summary every week">
            <Switch 
              checked={notifications.weeklyReport}
              onCheckedChange={(v) => setNotifications({...notifications, weeklyReport: v})}
            />
          </SettingsRow>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection 
          title="Security" 
          description="Keep your account secure"
          icon={Shield}
          delay={0.4}
        >
          <SettingsRow label="Change Password" description="Update your password">
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              Change
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </SettingsRow>
          
          <SettingsRow label="Two-Factor Authentication" description="Add an extra layer of security">
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              Enable
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </SettingsRow>
          
          <SettingsRow label="Active Sessions" description="Manage your active sessions">
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              View
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </SettingsRow>
        </SettingsSection>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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
              
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-white">Delete Account</p>
                  <p className="text-xs text-[#A1A1AA]">Permanently delete your account and data</p>
                </div>
                <Button variant="outline" size="sm" className="border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FF3B30]/10">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
