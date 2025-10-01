"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, TrendingDown, Search, Star, Loader2 } from "lucide-react"
import { cryptoAPI } from "@/lib/api/crypto-api"
import { TradeModal } from "@/components/trading/trade-modal"
import type { CryptoPriceData } from "@/lib/api/crypto-api"

export default function MarketsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [marketData, setMarketData] = useState<CryptoPriceData[]>([])
  const [filteredData, setFilteredData] = useState<CryptoPriceData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingMarkets, setLoadingMarkets] = useState(true)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<{ symbol: string; name: string; price: any } | undefined>()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoadingMarkets(true)
        const data = await cryptoAPI.getMarketData(50)
        setMarketData(data)
        setFilteredData(data)
      } catch (error) {
        console.error("[v0] Error loading market data:", error)
      } finally {
        setLoadingMarkets(false)
      }
    }

    loadMarketData()

    // Refresh market data every 30 seconds
    const interval = setInterval(loadMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(marketData)
    } else {
      const filtered = marketData.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredData(filtered)
    }
  }, [searchQuery, marketData])

  const handleTrade = (coin: CryptoPriceData) => {
    const cryptoData = {
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: {
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price * 49.5, // Convert to EGP
        change24h: coin.price_change_percentage_24h,
        volume24h: coin.total_volume * 49.5,
        updatedAt: new Date(),
      },
    }
    setSelectedCrypto(cryptoData)
    setTradeModalOpen(true)
  }

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
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Markets</h1>
                <p className="text-muted-foreground">Live cryptocurrency prices and trading</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cryptocurrencies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Markets</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMarkets ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Name</div>
                    <div className="col-span-2">Price (EGP)</div>
                    <div className="col-span-2">24h Change</div>
                    <div className="col-span-2">Market Cap</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {/* Table Rows */}
                  {filteredData.map((coin, index) => (
                    <div
                      key={coin.id}
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm text-muted-foreground">{index + 1}</span>
                      </div>

                      <div className="col-span-3 flex items-center gap-3">
                        <div>
                          <p className="font-medium">{coin.name}</p>
                          <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <span className="font-medium">
                          {(coin.current_price * 49.5).toLocaleString("en-EG", {
                            style: "currency",
                            currency: "EGP",
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center gap-1">
                          {coin.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-accent" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-destructive" />
                          )}
                          <span
                            className={`font-medium ${
                              coin.price_change_percentage_24h >= 0 ? "text-accent" : "text-destructive"
                            }`}
                          >
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                            {coin.price_change_percentage_24h?.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <span className="text-sm">
                          {(coin.market_cap * 49.5).toLocaleString("en-EG", {
                            style: "currency",
                            currency: "EGP",
                            notation: "compact",
                            maximumFractionDigits: 1,
                          })}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center gap-2">
                        <Button size="sm" onClick={() => handleTrade(coin)} className="bg-accent hover:bg-accent/90">
                          Trade
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredData.length === 0 && !loadingMarkets && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No cryptocurrencies found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Trade Modal */}
      <TradeModal isOpen={tradeModalOpen} onClose={() => setTradeModalOpen(false)} crypto={selectedCrypto} />
    </div>
  )
}
