"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/hooks/use-wallet"
import { TrendingUp, TrendingDown, ArrowUpDown, Calculator } from "lucide-react"

export function SimpleTradeInterface() {
  const { wallet, prices, updateBalance } = useWallet()
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [amountType, setAmountType] = useState<"crypto" | "fiat">("fiat")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  if (!wallet) return null

  const cryptoOptions = [
    { symbol: "BTC", name: "Bitcoin", price: prices.BTC?.price || 0, change: prices.BTC?.change24h || 0 },
    { symbol: "ETH", name: "Ethereum", price: prices.ETH?.price || 0, change: prices.ETH?.change24h || 0 },
    { symbol: "USDT", name: "Tether", price: prices.USDT?.price || 0, change: prices.USDT?.change24h || 0 },
  ]

  const selectedCryptoData = cryptoOptions.find((c) => c.symbol === selectedCrypto)
  const currentPrice = selectedCryptoData?.price || 0
  const fee = 0.001 // 0.1% fee

  const calculateTrade = () => {
    const numAmount = Number.parseFloat(amount) || 0

    if (amountType === "fiat") {
      // Amount in EGP, calculate crypto
      const cryptoAmount = numAmount / currentPrice
      const feeAmount = numAmount * fee
      return {
        cryptoAmount: cryptoAmount,
        fiatAmount: numAmount,
        fee: feeAmount,
        total: tradeType === "buy" ? numAmount + feeAmount : numAmount - feeAmount,
      }
    } else {
      // Amount in crypto, calculate EGP
      const fiatAmount = numAmount * currentPrice
      const feeAmount = fiatAmount * fee
      return {
        cryptoAmount: numAmount,
        fiatAmount: fiatAmount,
        fee: feeAmount,
        total: tradeType === "buy" ? fiatAmount + feeAmount : fiatAmount - feeAmount,
      }
    }
  }

  const tradeCalculation = calculateTrade()

  const canTrade = () => {
    if (!amount || Number.parseFloat(amount) <= 0) return false

    if (tradeType === "buy") {
      return wallet.egpBalance >= tradeCalculation.total
    } else {
      const cryptoBalance = wallet[`${selectedCrypto.toLowerCase()}Balance` as keyof typeof wallet] as number
      return cryptoBalance >= tradeCalculation.cryptoAmount
    }
  }

  const handleTrade = async () => {
    if (!canTrade()) return

    setLoading(true)

    try {
      // Simulate trade execution
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (tradeType === "buy") {
        // Deduct EGP, add crypto
        await updateBalance("egp", wallet.egpBalance - tradeCalculation.total)
        const currentCrypto = wallet[`${selectedCrypto.toLowerCase()}Balance` as keyof typeof wallet] as number
        await updateBalance(selectedCrypto.toLowerCase(), currentCrypto + tradeCalculation.cryptoAmount)
      } else {
        // Deduct crypto, add EGP
        const currentCrypto = wallet[`${selectedCrypto.toLowerCase()}Balance` as keyof typeof wallet] as number
        await updateBalance(selectedCrypto.toLowerCase(), currentCrypto - tradeCalculation.cryptoAmount)
        await updateBalance("egp", wallet.egpBalance + tradeCalculation.total)
      }

      setAmount("")
    } catch (error) {
      console.error("Trade failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Simple Trading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trade Type Tabs */}
        <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-accent">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-destructive">
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Crypto Selection */}
        <div className="space-y-2">
          <Label>Select Cryptocurrency</Label>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cryptoOptions.map((crypto) => (
                <SelectItem key={crypto.symbol} value={crypto.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {crypto.name} ({crypto.symbol})
                    </span>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm">{crypto.price.toLocaleString()} EGP</span>
                      <div className="flex items-center gap-1">
                        {crypto.change >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-accent" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )}
                        <span className={`text-xs ${crypto.change >= 0 ? "text-accent" : "text-destructive"}`}>
                          {crypto.change >= 0 ? "+" : ""}
                          {crypto.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Amount</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAmountType(amountType === "crypto" ? "fiat" : "crypto")}
              className="text-xs"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Switch to {amountType === "crypto" ? "EGP" : selectedCrypto}
            </Button>
          </div>

          <div className="relative">
            <Input
              type="number"
              placeholder={`Enter amount in ${amountType === "crypto" ? selectedCrypto : "EGP"}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {amountType === "crypto" ? selectedCrypto : "EGP"}
            </div>
          </div>
        </div>

        {/* Trade Preview */}
        {amount && Number.parseFloat(amount) > 0 && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium">Trade Preview</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Price per {selectedCrypto}:</span>
                <span>{currentPrice.toLocaleString()} EGP</span>
              </div>

              <div className="flex justify-between">
                <span>You {tradeType}:</span>
                <span>
                  {tradeCalculation.cryptoAmount.toFixed(6)} {selectedCrypto}
                </span>
              </div>

              <div className="flex justify-between">
                <span>For:</span>
                <span>{tradeCalculation.fiatAmount.toLocaleString()} EGP</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Trading fee (0.1%):</span>
                <span>{tradeCalculation.fee.toFixed(2)} EGP</span>
              </div>

              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total {tradeType === "buy" ? "cost" : "received"}:</span>
                <span>{tradeCalculation.total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        )}

        {/* Balance Check */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Available Balance:</span>
            <span>
              {tradeType === "buy"
                ? `${wallet.egpBalance.toLocaleString()} EGP`
                : `${(wallet[`${selectedCrypto.toLowerCase()}Balance` as keyof typeof wallet] as number).toFixed(6)} ${selectedCrypto}`}
            </span>
          </div>

          {!canTrade() && amount && Number.parseFloat(amount) > 0 && (
            <Alert variant="destructive">
              <AlertDescription>Insufficient balance for this trade</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Trade Button */}
        <Button
          onClick={handleTrade}
          disabled={!canTrade() || loading}
          className={`w-full ${tradeType === "buy" ? "bg-accent hover:bg-accent/90" : "bg-destructive hover:bg-destructive/90"}`}
        >
          {loading ? "Processing..." : `${tradeType === "buy" ? "Buy" : "Sell"} ${selectedCrypto}`}
        </Button>
      </CardContent>
    </Card>
  )
}
