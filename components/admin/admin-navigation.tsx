"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, CreditCard, Shield, Settings, BarChart3, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
    { name: "KYC Approvals", href: "/admin/kyc", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile Navigation Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r p-6">
            <div className="flex items-center gap-2 mb-8 mt-12">
              <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-destructive-foreground" />
              </div>
              <span className="text-xl font-bold">Admin Panel</span>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-destructive text-destructive-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:bg-card md:border-r md:flex md:flex-col md:z-30">
        <div className="flex items-center gap-2 p-6 border-b">
          <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-destructive-foreground" />
          </div>
          <span className="text-xl font-bold">Admin Panel</span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-destructive text-destructive-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop Content Spacer */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0" />
    </>
  )
}
