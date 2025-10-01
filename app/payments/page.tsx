"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepositForm } from "@/components/payments/deposit-form"
import { WithdrawForm } from "@/components/payments/withdraw-form"
import { TransactionHistory } from "@/components/payments/transaction-history"
import { CreditCard, ArrowDownLeft, ArrowUpRight, History } from "lucide-react"

export default function PaymentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Payments</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="deposit" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit" className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit">
              <div className="max-w-2xl mx-auto">
                <DepositForm />
              </div>
            </TabsContent>

            <TabsContent value="withdraw">
              <div className="max-w-2xl mx-auto">
                <WithdrawForm />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
