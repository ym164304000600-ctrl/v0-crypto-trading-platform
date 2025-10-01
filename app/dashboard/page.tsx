"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { PortfolioCard } from "@/components/dashboard/portfolio-card"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Bell, Settings, Gift, Users } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore"

// 🔥 MarketTicker (شريط العملات)
function MarketTicker() {
  const [coins, setCoins] = useState<any[]>([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "coins"), (snap) => {
      setCoins(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  return (
    <div className="w-full overflow-x-auto border-b bg-card/40 backdrop-blur">
      <div className="flex gap-8 px-4 py-2 animate-marquee">
        {coins.map((coin) => (
          <div key={coin.id} className="flex items-center gap-2 text-sm font-medium">
            <span>{coin.symbol}</span>
            <span>${coin.price}</span>
            <span className={coin.change >= 0 ? "text-green-500" : "text-red-500"}>
              {coin.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 💰 My Holdings + نافذة البيع/الشراء
function CryptoHoldings({ user }: { user: any }) {
  const [coins, setCoins] = useState<any[]>([])
  const [selectedCoin, setSelectedCoin] = useState<any>(null)
  const [action, setAction] = useState<"buy" | "sell" | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "coins"), (snap) => {
      setCoins(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  const handleOpen = (coin: any, type: "buy" | "sell") => {
    setSelectedCoin(coin)
    setAction(type)
    setAmount("")
    setOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedCoin || !action || !amount) return

    const qty = selectedCoin.quantity || 0
    const price = selectedCoin.price
    const totalCost = Number(amount) * price

    if (action === "buy") {
      if (user.egpBalance < totalCost) {
        alert("رصيدك غير كافي للشراء!")
        return
      }
      await updateDoc(doc(db, "coins", selectedCoin.id), {
        quantity: qty + Number(amount),
      })
    } else if (action === "sell") {
      if (qty < Number(amount)) {
        alert("لا يوجد كمية كافية للبيع!")
        return
      }
      await updateDoc(doc(db, "coins", selectedCoin.id), {
        quantity: qty - Number(amount),
      })
    }

    setOpen(false)
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 text-lg">My Holdings</h2>
          <div className="space-y-4">
            {coins.map((coin) => {
              const qty = coin.quantity || 0
              const totalValue = (qty * coin.price).toFixed(2)

              return (
                <div
                  key={coin.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                      {coin.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {coin.name} ({coin.symbol})
                      </p>
                      <p className="text-xs text-muted-foreground">Qty: {qty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${coin.price}</p>
                    <p className="text-xs text-muted-foreground">≈ ${totalValue}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpen(coin, "buy")}
                      >
                        Buy
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => handleOpen(coin, "sell")}
                        disabled={qty === 0}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* نافذة احترافية واحدة للشراء والبيع */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "buy" ? "شراء" : "بيع"} {selectedCoin?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>السعر الحالي: ${selectedCoin?.price}</p>
            <Input
              type="number"
              value={amount}
              min={1}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="أدخل الكمية"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleConfirm}>
              تأكيد {action === "buy" ? "الشراء" : "البيع"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function DashboardPage() {
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user.displayName || "Trader"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Badge
                  variant={user.kycStatus === "verified" ? "secondary" : "destructive"}
                  className="capitalize"
                >
                  KYC: {user.kycStatus}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Market Ticker */}
        <MarketTicker />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Portfolio Overview */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PortfolioCard />
              </div>
              <div>
                <CryptoHoldings user={user} />
              </div>
            </div>

            {/* Charts and Transactions */}
            <div className="grid lg:grid-cols-2 gap-6">
              <PortfolioChart />
              <RecentTransactions />
            </div>

            {/* Promo Banners */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Gift className="w-6 h-6 text-accent" />
                    <div className="flex-1">
                      <h3 className="font-semibold">Welcome Bonus</h3>
                      <p className="text-sm text-muted-foreground">
                        Get 100 EGP bonus on your first deposit
                      </p>
                    </div>
                    <Button size="sm">Claim</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Users className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">Refer Friends</h3>
                      <p className="text-sm text-muted-foreground">
                        Earn 50 EGP for each referral
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
