"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepositForm } from "@/components/payments/deposit-form"
import { WithdrawForm } from "@/components/payments/withdraw-form"
import { TransactionHistory } from "@/components/payments/transaction-history"
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { CreditCard, ArrowDownLeft, ArrowUpRight, History, Wallet } from "lucide-react"

export default function PaymentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setBalance(Number(data.balance) || 0)
        setTotalDeposits(Number(data.totalDeposits) || 0)
        setTotalWithdrawals(Number(data.totalWithdrawals) || 0)
      }
    })
    return () => unsub()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

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

        {/* Bank Card Balance */}
        <section className="container mx-auto px-4 py-6">
          <div className="relative w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">My Wallet</p>
              <Wallet className="w-6 h-6" />
            </div>
            <p className="mt-4 text-3xl font-bold">{balance.toLocaleString()} EGP</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-200">Deposits</p>
                <p className="text-green-300 font-semibold">
                  +{totalDeposits.toLocaleString()} EGP
                </p>
              </div>
              <div>
                <p className="text-gray-200">Withdrawals</p>
                <p className="text-red-300 font-semibold">
                  -{totalWithdrawals.toLocaleString()} EGP
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 right-6 text-xs text-gray-300">
              **** **** **** 4582
            </div>
          </div>
        </section>

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
