"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/use-wallet"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, BarChart3, BookOpen } from "lucide-react"

export function ProTradeInterface() {
  const { wallet, prices } = useWallet()
  const [selectedPair, setSelectedPair] = useState("BTC/EGP")
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")

  // Mock candlestick data
  const chartData = [
    { time: "09:00", open: 2750000, high: 2780000, low: 2740000, close: 2770000, volume: 1200 },
    { time: "10:00", open: 2770000, high: 2790000, low: 2760000, close: 2785000, volume: 1500 },
    { time: "11:00", open: 2785000, high: 2800000, low: 2775000, close: 2795000, volume: 1800 },
    { time: "12:00", open: 2795000, high: 2810000, low: 2790000, close: 2805000, volume: 2100 },
    { time: "13:00", open: 2805000, high: 2820000, low: 2800000, close: 2815000, volume: 1900 },
    { time: "14:00", open: 2815000, high: 2825000, low: 2810000, close: 2820000, volume: 1600 },
  ]

  // Mock orderbook data
  const orderbook = {
    bids: [
      { price: 2819000, amount: 0.5, total: 1409500 },
      { price: 2818000, amount: 1.2, total: 3381600 },
      { price: 2817000, amount: 0.8, total: 2253600 },
      { price: 2816000, amount: 2.1, total: 5913600 },
      { price: 2815000, amount: 1.5, total: 4222500 },
    ],
    asks: [
      { price: 2820000, amount: 0.7, total: 1974000 },
      { price: 2821000, amount: 1.1, total: 3103100 },
      { price: 2822000, amount: 0.9, total: 2539800 },
      { price: 2823000, amount: 1.8, total: 5081400 },
      { price: 2824000, amount: 2.2, total: 6212800 },
    ],
  }

  // Mock recent trades
  const recentTrades = [
    { price: 2820000, amount: 0.15, time: "14:32:15", side: "buy" },
    { price: 2819500, amount: 0.08, time: "14:32:10", side: "sell" },
    { price: 2820000, amount: 0.25, time: "14:32:05", side: "buy" },
    { price: 2819000, amount: 0.12, time: "14:32:00", side: "sell" },
    { price: 2820500, amount: 0.18, time: "14:31:55", side: "buy" },
  ]

  const currentPrice = prices.BTC?.price || 2820000

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Chart Section */}
      <div className="lg:col-span-3 space-y-6">
        {/* Price Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {selectedPair}
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold">{currentPrice.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-accent text-sm">+2.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={["dataMin - 10000", "dataMax + 10000"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(2)}M`}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis hide />
                  <Bar dataKey="volume" fill="hsl(var(--muted))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Panel */}
      <div className="space-y-6">
        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Type */}
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buy/Sell Tabs */}
            <Tabs value={side} onValueChange={(value) => setSide(value as "buy" | "sell")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="text-accent">
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="text-destructive">
                  Sell
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Price Input (for limit/stop orders) */}
            {orderType !== "market" && (
              <div className="space-y-2">
                <Label>Price (EGP)</Label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            {/* Stop Price (for stop orders) */}
            {orderType === "stop" && (
              <div className="space-y-2">
                <Label>Stop Price (EGP)</Label>
                <Input
                  type="number"
                  placeholder="Enter stop price"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                />
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount (BTC)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Order Summary */}
            {amount && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{amount} BTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>{orderType === "market" ? "Market" : `${price} EGP`}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>
                    {orderType === "market"
                      ? `≈ ${(Number.parseFloat(amount) * currentPrice).toLocaleString()} EGP`
                      : `${(Number.parseFloat(amount) * Number.parseFloat(price || "0")).toLocaleString()} EGP`}
                  </span>
                </div>
              </div>
            )}

            {/* Place Order Button */}
            <Button
              className={`w-full ${side === "buy" ? "bg-accent hover:bg-accent/90" : "bg-destructive hover:bg-destructive/90"}`}
            >
              {side === "buy" ? "Buy" : "Sell"} BTC
            </Button>
          </CardContent>
        </Card>

        {/* Orderbook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5" />
              Order Book
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Asks */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-destructive">Asks (Sell Orders)</h4>
              {orderbook.asks.reverse().map((ask, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-destructive">{ask.price.toLocaleString()}</span>
                  <span>{ask.amount.toFixed(3)}</span>
                </div>
              ))}
            </div>

            {/* Current Price */}
            <div className="text-center py-2 border-y">
              <span className="text-lg font-bold">{currentPrice.toLocaleString()}</span>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span className="text-xs text-accent">+2.5%</span>
              </div>
            </div>

            {/* Bids */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-accent">Bids (Buy Orders)</h4>
              {orderbook.bids.map((bid, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-accent">{bid.price.toLocaleString()}</span>
                  <span>{bid.amount.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTrades.map((trade, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className={trade.side === "buy" ? "text-accent" : "text-destructive"}>
                    {trade.price.toLocaleString()}
                  </span>
                  <span>{trade.amount.toFixed(3)}</span>
                  <span className="text-muted-foreground">{trade.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
