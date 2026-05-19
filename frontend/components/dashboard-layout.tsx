"use client"

import { ReactNode, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  Brain, 
  Bell, 
  Settings,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react"
import { LogoAurex } from "@/components/logo-aurex"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen"
import { IS_MOCK_MODE } from "@/lib/config"
import { getCurrentUser, logout } from "@/services/auth.service"
import type { User } from "@/types"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Markets", href: "/markets", icon: BarChart3 },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "AI Insights", href: "/ai-insights", icon: Brain },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
]

function Sidebar({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user: User
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-[min(16rem,85vw)] max-w-[85vw] flex-col border-r border-white/5 bg-[#080808] sm:w-64",
          "lg:translate-x-0 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 p-4 sm:p-6">
          <Link href="/" className="block min-w-0 max-w-full flex-1" onClick={onClose}>
            <LogoAurex size="sm" showTagline={false} />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-[#A1A1AA] hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/20"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A227] to-[#E8C547] flex items-center justify-center text-white text-sm font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-[#A1A1AA] truncate">{user.plan.toUpperCase()} Plan</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

function Header({
  onMenuClick,
  user,
  onSignOut,
}: {
  onMenuClick: () => void
  user: User
  onSignOut: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Get current page title
  const currentNav = navItems.find(item => item.href === pathname)
  const pageTitle = currentNav?.label || "Dashboard"

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-6">
        {/* Left - Menu & Title */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden text-[#A1A1AA] hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="truncate text-base font-semibold text-white sm:text-xl">
            {pageTitle}
          </h1>
        </div>

        {/* Center - Search */}
        <div className="mx-auto hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <Input
              placeholder="Search assets, markets..."
              className="w-full pl-10 bg-[#111] border-white/5 text-white placeholder:text-[#A1A1AA] focus:border-[#C9A227]/50 focus:ring-[#C9A227]/20"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#A1A1AA] hover:text-white"
            asChild
          >
            <Link href="/alerts" aria-label="Alerts">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C9A227]" />
            </Link>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 text-[#A1A1AA] hover:text-white sm:px-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A227] to-[#E8C547] text-xs font-semibold text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="hidden text-sm sm:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className="hidden h-4 w-4 sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#111] border-white/10 text-white">
              <DropdownMenuItem
                className="focus:bg-white/5 focus:text-white cursor-pointer"
                onSelect={(event) => {
                  event.preventDefault()
                  router.push('/settings#profile')
                }}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-white/5 focus:text-white cursor-pointer"
                onSelect={(event) => {
                  event.preventDefault()
                  router.push('/settings')
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="focus:bg-white/5 text-[#C9A227] focus:text-[#C9A227]"
                onSelect={(event) => {
                  event.preventDefault()
                  onSignOut()
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  const handleSignOut = useCallback(() => {
    logout()
    router.push(IS_MOCK_MODE ? "/" : "/login")
    router.refresh()
  }, [router])

  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = ""
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [sidebarOpen])

  return (
    <AuthGuard>
      {userLoading || !user ? (
        <AuthLoadingScreen message="Loading workspace…" />
      ) : (
    <div className="min-h-screen overflow-x-clip bg-[#050505]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      {/* Main content area */}
      <div className="min-w-0 lg:pl-64">
        <Header
              onMenuClick={() => setSidebarOpen(true)}
              user={user}
              onSignOut={handleSignOut}
            />
        <main className="overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <div className="aurex-page-stack">{children}</div>
        </main>
      </div>
    </div>
      )}
    </AuthGuard>
  )
}
