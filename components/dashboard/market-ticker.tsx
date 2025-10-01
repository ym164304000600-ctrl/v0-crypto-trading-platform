"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { TrendingUp, TrendingDown } from "lucide-react"

export function MarketTicker() {
  const [coins, setCoins] = useState<any[]>([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "coins"), (snap) => {
      setCoins(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  return (
    <div className="w-full overflow-hidden border-y bg-card">
      <div className="flex animate-scroll">
        {[...coins, ...coins].map((coin, i) => (
          <div key={i} className="flex items-center gap-2 px-6 py-2 whitespace-nowrap">
            <span className="font-medium">{coin.symbol}</span>
            <span className="text-muted-foreground">{coin.price} EGP</span>
            <div className="flex items-center gap-1">
              {coin.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${coin.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {coin.change24h}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
