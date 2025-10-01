"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { tradingService } from "@/lib/trading-service"
import type { CryptoPrice } from "@/lib/types"

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  crypto?: {
    symbol: string
    name: string
    price: CryptoPrice
  }
}

export function TradeModal({ isOpen, onClose, crypto }: TradeModalProps) {
  const { user } = useAuth()
  const { wallet, prices } = useWallet()
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const currentPrice = crypto ? prices[crypto.symbol]?.price || 0 : 0
  const total = Number.parseFloat(amount) * currentPrice || 0
  const fees = tradingService.calculateTradingFee(total)
  const totalWithFees = total + fees

  useEffect(() => {
    if (isOpen) {
      setAmount("")
      setError("")
      setSuccess("")
    }
  }, [isOpen])

  const handleTrade = async () => {
    if (!user || !wallet || !crypto) return

    const tradeAmount = Number.parseFloat(amount)
    if (!tradeAmount || tradeAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!tradingService.validateTradeAmount(tradeAmount)) {
      setError("Minimum trade amount is 0.0001")
      return
    }

    if (!tradingService.validateTradeTotal(total)) {
      setError("Minimum trade value is 50 EGP")
      return
    }

    // Check balances
    if (activeTab === "buy" && wallet.egpBalance < totalWithFees) {
      setError("Insufficient EGP balance")
      return
    }

    if (activeTab === "sell") {
      const cryptoBalance = (wallet[`${crypto.symbol.toLowerCase()}Balance` as keyof typeof wallet] as number) || 0
      if (cryptoBalance < tradeAmount) {
        setError(`Insufficient ${crypto.symbol} balance`)
        return
      }
    }

    setLoading(true)
    setError("")

    try {
      const result = await tradingService.executeTrade({
        userId: user.uid,
        type: activeTab,
        cryptoSymbol: crypto.symbol,
        amount: tradeAmount,
        price: currentPrice,
        total: activeTab === "buy" ? totalWithFees : total - fees,
      })

      if (result.success) {
        setSuccess(`${activeTab === "buy" ? "Purchase" : "Sale"} completed successfully!`)
        setAmount("")
        setTimeout(() => {
          onClose()
          setSuccess("")
        }, 2000)
      } else {
        setError(result.error || "Trade failed")
      }
    } catch (error) {
      setError("Trade execution failed")
    } finally {
      setLoading(false)
    }
  }

  if (!crypto) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Trade {crypto.name} ({crypto.symbol})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Price */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-lg font-semibold">
                    {currentPrice.toLocaleString("en-EG", {
                      style: "currency",
                      currency: "EGP",
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {crypto.price.change24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-accent" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-sm ${crypto.price.change24h >= 0 ? "text-accent" : "text-destructive"}`}>
                    {crypto.price.change24h >= 0 ? "+" : ""}
                    {crypto.price.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "buy" | "sell")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="text-accent">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="text-destructive">
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount ({crypto.symbol})</Label>
                <Input
                  id="buy-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                />
              </div>

              {wallet && (
                <p className="text-sm text-muted-foreground">
                  Available:{" "}
                  {wallet.egpBalance.toLocaleString("en-EG", {
                    style: "currency",
                    currency: "EGP",
                  })}
                </p>
              )}
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount ({crypto.symbol})</Label>
                <Input
                  id="sell-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                />
              </div>

              {wallet && (
                <p className="text-sm text-muted-foreground">
                  Available:{" "}
                  {((wallet[`${crypto.symbol.toLowerCase()}Balance` as keyof typeof wallet] as number) || 0).toFixed(8)}{" "}
                  {crypto.symbol}
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Trade Summary */}
          {amount && Number.parseFloat(amount) > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>
                    {Number.parseFloat(amount).toFixed(8)} {crypto.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span>{currentPrice.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{total.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fees (0.1%):</span>
                  <span>{fees.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {(activeTab === "buy" ? totalWithFees : total - fees).toLocaleString("en-EG", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button
            onClick={handleTrade}
            disabled={loading || !amount || Number.parseFloat(amount) <= 0}
            className="w-full"
            variant={activeTab === "buy" ? "default" : "destructive"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activeTab === "buy" ? "Buy" : "Sell"} {crypto.symbol}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
