"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { useWallet } from "@/hooks/use-wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownLeft, QrCode, Copy, Download, WalletIcon } from "lucide-react"

export default function WalletPage() {
  const { user, loading } = useAuth()
  const { wallet, prices } = useWallet()
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

  if (!user || !wallet) {
    return null
  }

  const wallets = [
    {
      symbol: "EGP",
      name: "Egyptian Pound",
      balance: wallet.egpBalance,
      price: 1,
      icon: "£",
      address: null,
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      balance: wallet.btcBalance,
      price: prices.BTC?.price || 0,
      icon: "₿",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: wallet.ethBalance,
      price: prices.ETH?.price || 0,
      icon: "Ξ",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e",
    },
    {
      symbol: "USDT",
      name: "Tether",
      balance: wallet.usdtBalance,
      price: prices.USDT?.price || 0,
      icon: "₮",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WalletIcon className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Wallet</h1>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Wallet Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {wallets.map((walletItem) => {
                const value = walletItem.balance * walletItem.price

                return (
                  <Card key={walletItem.symbol} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            {walletItem.icon}
                          </div>
                          <div>
                            <CardTitle className="text-sm">{walletItem.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{walletItem.symbol}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold">
                          {walletItem.balance.toFixed(walletItem.symbol === "EGP" ? 0 : 6)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {walletItem.symbol === "EGP"
                            ? `≈ $${(value / 49.5).toFixed(2)} USD`
                            : `≈ ${value.toLocaleString()} EGP`}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                          Receive
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Wallet Details */}
            <Card>
              <CardHeader>
                <CardTitle>Wallet Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="addresses">
                  <TabsList>
                    <TabsTrigger value="addresses">Addresses</TabsTrigger>
                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="addresses" className="space-y-4">
                    {wallets
                      .filter((w) => w.address)
                      .map((walletItem) => (
                        <div
                          key={walletItem.symbol}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {walletItem.icon}
                            </div>
                            <div>
                              <p className="font-medium">{walletItem.name}</p>
                              <p className="text-sm text-muted-foreground font-mono">{walletItem.address}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <QrCode className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No transactions yet</p>
                      <p className="text-sm">Your transaction history will appear here</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
