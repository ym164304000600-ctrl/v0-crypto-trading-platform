"use client"

import { useWallet } from "@/hooks/use-wallet"
import { TrendingUp, TrendingDown } from "lucide-react"

export function MarketTicker() {
  const { prices } = useWallet()

  const marketData = Object.values(prices).map((price) => ({
    ...price,
    priceFormatted: price.price.toLocaleString("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }),
  }))

  return (
    <div className="bg-card border-y overflow-hidden">
      <div className="flex animate-scroll">
        {[...marketData, ...marketData].map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex items-center gap-2 px-6 py-3 whitespace-nowrap">
            <span className="font-medium">{item.symbol}</span>
            <span className="text-muted-foreground">{item.priceFormatted}</span>
            <div className="flex items-center gap-1">
              {item.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3 text-accent" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={`text-xs ${item.change24h >= 0 ? "text-accent" : "text-destructive"}`}>
                {item.change24h >= 0 ? "+" : ""}
                {item.change24h}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
