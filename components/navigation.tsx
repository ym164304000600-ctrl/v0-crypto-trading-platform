"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Activity, BarChart3, ChevronRight, CreditCard, LayoutDashboard, LogOut,
  Menu, ShieldCheck, TrendingUp, User, Users, Wallet, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Markets", href: "/markets", icon: Activity },
  { name: "Trade", href: "/trading", icon: BarChart3 },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Payments", href: "/payments", icon: CreditCard },
]

const accountNavigation = [
  { name: "Referrals", href: "/referrals", icon: Users },
  { name: "Security", href: "/security", icon: ShieldCheck },
]

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_oklch(0.77_0.14_174/22%)]">
        <TrendingUp className="size-5" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight">CryptoEgypt</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Digital assets</span>
      </span>
    </Link>
  )
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
      <nav aria-label="Main navigation" className="flex flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-primary/12 text-primary shadow-[inset_2px_0_0_var(--primary)]"
                  : "text-muted-foreground hover:bg-muted/75 hover:text-foreground",
              )}
            >
              <Icon className="size-[17px] shrink-0" strokeWidth={1.8} />
              <span className="flex-1">{item.name}</span>
              {active && <ChevronRight className="size-3.5 opacity-70" />}
            </Link>
          )
        })}
      </nav>
      <p className="mt-8 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your account</p>
      <nav aria-label="Account navigation" className="flex flex-col gap-1">
        {accountNavigation.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                active ? "bg-primary/12 text-primary shadow-[inset_2px_0_0_var(--primary)]" : "text-muted-foreground hover:bg-muted/75 hover:text-foreground",
              )}
            >
              <Icon className="size-[17px] shrink-0" strokeWidth={1.8} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  if (!user) return null

  const profile = (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <User className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{user.email || user.phoneNumber}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">Verified account</p>
      </div>
      <span className="size-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10" aria-label="Online" />
    </div>
  )

  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          className="border-border/80 bg-card/90 shadow-lg backdrop-blur-xl"
        >
          {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/75 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)}>
          <aside
            aria-label="Mobile navigation"
            className="fixed inset-y-0 left-0 flex w-[min(84vw,300px)] flex-col border-r border-border/70 bg-card p-5 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-9 mt-12 px-1"><Brand /></div>
            <div className="flex-1 overflow-y-auto"><NavigationLinks onNavigate={() => setIsOpen(false)} /></div>
            <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4">
              {profile}
              <Button variant="outline" onClick={handleLogout} className="w-full justify-start gap-2.5">
                <LogOut className="size-4" /> Log out
              </Button>
            </div>
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border/70 bg-card/85 px-4 pb-4 pt-6 backdrop-blur-xl md:flex">
        <div className="px-2 pb-8"><Brand /></div>
        <div className="flex-1 overflow-y-auto px-1"><NavigationLinks /></div>
        <div className="flex flex-col gap-3 border-t border-border/70 pt-4">
          {profile}
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" /> Log out
          </Button>
        </div>
      </aside>
      <div className="hidden w-[264px] shrink-0 md:block" aria-hidden="true" />
    </>
  )
}
