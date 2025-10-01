"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, Loader2 } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"

export function RecentTransactions() {
  const { transactions, loading, error, refreshTransactions } = useTransactions()

  function formatTimestamp(date: Date): string {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <TrendingUp className="w-4 h-4 text-accent" />
      case "sell":
        return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-primary" />
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-orange-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshTransactions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshTransactions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-2">Start trading to see your activity here</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {transaction.type} {transaction.cryptoSymbol || "EGP"}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatTimestamp(transaction.createdAt)}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {transaction.amount} {transaction.cryptoSymbol || "EGP"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {transaction.total.toLocaleString("en-EG", {
                      style: "currency",
                      currency: "EGP",
                      minimumFractionDigits: 0,
                    })}
                  </span>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
