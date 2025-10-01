"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Clock, CheckCircle, XCircle } from "lucide-react"

export function MyOrders() {
  // Mock orders data
  const openOrders = [
    {
      id: "1",
      pair: "BTC/EGP",
      type: "limit",
      side: "buy",
      amount: 0.5,
      price: 2800000,
      filled: 0,
      status: "pending",
      timestamp: "2025-01-09 14:30:00",
    },
    {
      id: "2",
      pair: "ETH/EGP",
      type: "limit",
      side: "sell",
      amount: 2.0,
      price: 180000,
      filled: 0.5,
      status: "partial",
      timestamp: "2025-01-09 13:45:00",
    },
  ]

  const orderHistory = [
    {
      id: "3",
      pair: "BTC/EGP",
      type: "market",
      side: "buy",
      amount: 0.1,
      price: 2820000,
      filled: 0.1,
      status: "filled",
      timestamp: "2025-01-09 12:15:00",
    },
    {
      id: "4",
      pair: "USDT/EGP",
      type: "limit",
      side: "sell",
      amount: 1000,
      price: 49.5,
      filled: 0,
      status: "cancelled",
      timestamp: "2025-01-09 11:30:00",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            Partial
          </Badge>
        )
      case "filled":
        return (
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            <CheckCircle className="w-3 h-3 mr-1" />
            Filled
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSideBadge = (side: string) => {
    return (
      <Badge
        variant={side === "buy" ? "secondary" : "destructive"}
        className={side === "buy" ? "bg-accent/10 text-accent" : ""}
      >
        {side.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Open Orders ({openOrders.length})</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            {openOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No open orders</p>
                <p className="text-sm">Your active orders will appear here</p>
              </div>
            ) : (
              openOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.pair}</span>
                      {getSideBadge(order.side)}
                      <Badge variant="outline" className="capitalize">
                        {order.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {order.amount} {order.pair.split("/")[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium">{order.price.toLocaleString()} EGP</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Filled</p>
                      <p className="font-medium">
                        {order.filled} / {order.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">{(order.amount * order.price).toLocaleString()} EGP</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Created: {order.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {orderHistory.map((order) => (
              <div key={order.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.pair}</span>
                    {getSideBadge(order.side)}
                    <Badge variant="outline" className="capitalize">
                      {order.type}
                    </Badge>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {order.amount} {order.pair.split("/")[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{order.price.toLocaleString()} EGP</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Filled</p>
                    <p className="font-medium">
                      {order.filled} / {order.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">{(order.filled * order.price).toLocaleString()} EGP</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Completed: {order.timestamp}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
