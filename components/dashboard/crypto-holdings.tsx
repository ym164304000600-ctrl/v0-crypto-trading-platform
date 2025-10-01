"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

export function CryptoHoldings() {
  const { wallet, prices } = useWallet()

  if (!wallet) return null

  const holdings = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      balance: wallet.btcBalance,
      price: prices.BTC?.price || 0,
      change: prices.BTC?.change24h || 0,
      icon: "₿",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: wallet.ethBalance,
      price: prices.ETH?.price || 0,
      change: prices.ETH?.change24h || 0,
      icon: "Ξ",
    },
    {
      symbol: "USDT",
      name: "Tether",
      balance: wallet.usdtBalance,
      price: prices.USDT?.price || 0,
      change: prices.USDT?.change24h || 0,
      icon: "₮",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Holdings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {holdings.map((holding) => {
          const value = holding.balance * holding.price

          return (
            <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {holding.icon}
                </div>
                <div>
                  <p className="font-medium">{holding.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {holding.balance.toFixed(6)} {holding.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {value.toLocaleString("en-EG", {
                    style: "currency",
                    currency: "EGP",
                    minimumFractionDigits: 0,
                  })}
                </p>
                <div className="flex items-center gap-1">
                  {holding.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-accent" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span className={`text-xs ${holding.change >= 0 ? "text-accent" : "text-destructive"}`}>
                    {holding.change >= 0 ? "+" : ""}
                    {holding.change}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* EGP Balance */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
              £
            </div>
            <div>
              <p className="font-medium">Egyptian Pound</p>
              <p className="text-sm text-muted-foreground">Fiat Balance</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-medium">
              {wallet.egpBalance.toLocaleString("en-EG", {
                style: "currency",
                currency: "EGP",
                minimumFractionDigits: 0,
              })}
            </p>
            <Badge variant="secondary" className="text-xs">
              Stable
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
