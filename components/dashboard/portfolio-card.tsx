"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Plus, Minus } from "lucide-react"
import { useState } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { TradeModal } from "@/components/trading/trade-modal"

export function PortfolioCard() {
  const { wallet, prices, getTotalValueInEGP, getTotalValueInUSD } = useWallet()
  const [showBalance, setShowBalance] = useState(true)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<{ symbol: string; name: string; price: any } | undefined>()

  if (!wallet) return null

  const totalEGP = getTotalValueInEGP()
  const totalUSD = getTotalValueInUSD()
  const change24h = 2.5 // Mock 24h change

  const handleQuickTrade = (symbol: string) => {
    const cryptoData = {
      symbol,
      name: symbol === "BTC" ? "Bitcoin" : symbol === "ETH" ? "Ethereum" : "Tether",
      price: prices[symbol],
    }
    setSelectedCrypto(cryptoData)
    setTradeModalOpen(true)
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-foreground/80 text-sm">Total Portfolio Value</p>
              <div className="flex items-center gap-2">
                {showBalance ? (
                  <h2 className="text-3xl font-bold">
                    {totalEGP.toLocaleString("en-EG", {
                      style: "currency",
                      currency: "EGP",
                      minimumFractionDigits: 0,
                    })}
                  </h2>
                ) : (
                  <h2 className="text-3xl font-bold">••••••</h2>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
              {showBalance && (
                <p className="text-primary-foreground/80 text-sm">
                  ≈ ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                {change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-accent" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={`text-sm font-medium ${change24h >= 0 ? "text-accent" : "text-destructive"}`}>
                  {change24h >= 0 ? "+" : ""}
                  {change24h}%
                </span>
              </div>
              <p className="text-primary-foreground/80 text-xs">24h Change</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex flex-col gap-1 h-auto py-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
              onClick={() => handleQuickTrade("BTC")}
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">Buy</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="flex flex-col gap-1 h-auto py-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
              onClick={() => handleQuickTrade("BTC")}
            >
              <Minus className="w-4 h-4" />
              <span className="text-xs">Sell</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="flex flex-col gap-1 h-auto py-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-xs">Deposit</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="flex flex-col gap-1 h-auto py-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs">Withdraw</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <TradeModal isOpen={tradeModalOpen} onClose={() => setTradeModalOpen(false)} crypto={selectedCrypto} />
    </>
  )
}
