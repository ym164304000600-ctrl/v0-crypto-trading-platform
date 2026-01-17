"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

export function RecentTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid))
    const unsub = onSnapshot(q, (snap) => {
      // Sort in application layer instead of using orderBy in Firestore query
      const sorted = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp)
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp)
          return timeB.getTime() - timeA.getTime()
        })
      setTransactions(sorted)
    })
    return () => unsub()
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between border-b pb-2 last:border-none">
                <div>
                  <p className="font-medium">
                    {tx.type} {tx.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp?.toDate?.() || tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`font-semibold ${tx.type === "buy" ? "text-green-500" : "text-red-500"}`}>
                  {tx.type === "buy" ? "+" : "-"} {tx.amount}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
