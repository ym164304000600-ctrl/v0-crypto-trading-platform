"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods"
import { useAuth } from "@/contexts/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowUpRight, Shield, CheckCircle, AlertTriangle } from "lucide-react"

export function WithdrawForm() {
  const { user } = useAuth()
  const { wallet } = useWallet()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [otpCode, setOtpCode] = useState("")

  const handleMethodSelect = (methodId: string) => {
    const method = PAYMENT_METHODS.find((m) => m.id === methodId)
    setSelectedMethod(method || null)
    setFormData({})
    setAmount("")
    setError("")
  }

  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!selectedMethod || !amount || !user || !wallet) return false

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return false
    }

    if (numAmount < selectedMethod.minAmount || numAmount > selectedMethod.maxAmount) {
      setError(`Amount must be between ${selectedMethod.minAmount} and ${selectedMethod.maxAmount} EGP`)
      return false
    }

    if (numAmount > wallet.egpBalance) {
      setError("Insufficient balance")
      return false
    }

    // Validate required fields
    for (const field of selectedMethod.fields) {
      if (field.required && !formData[field.name]) {
        setError(`Please fill in ${field.label}`)
        return false
      }
    }

    return true
  }

  const handleWithdraw = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      // Simulate OTP verification
      if (otpCode !== "123456") {
        setError("Invalid OTP code")
        setLoading(false)
        return
      }

      // Create withdrawal record
      await addDoc(collection(db, "transactions"), {
        userId: user!.uid,
        type: "withdrawal",
        amount: Number.parseFloat(amount),
        currency: "EGP",
        paymentMethodId: selectedMethod!.id,
        paymentMethodName: selectedMethod!.name,
        formData,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setSuccess(true)
      setShowConfirmation(false)
    } catch (error: any) {
      setError(error.message || "Failed to submit withdrawal")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-accent" />
          </div>
          <CardTitle>Withdrawal Submitted Successfully</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Alert>
            <AlertDescription>
              Your withdrawal request has been submitted and is being processed. Funds will be transferred within the
              specified timeframe.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setSuccess(false)} variant="outline">
            Make Another Withdrawal
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5" />
          Withdraw Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="text-2xl font-bold text-primary">{wallet?.egpBalance.toLocaleString() || 0} EGP</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label>Select Withdrawal Method</Label>
          <Select onValueChange={handleMethodSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a withdrawal method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.filter((method) => method.isActive && method.type !== "card").map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{method.icon}</span>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.minAmount}-{method.maxAmount.toLocaleString()} EGP • {method.settlementTime}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMethod && (
          <>
            {/* Method Info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{selectedMethod.name}</h4>
                <Badge variant="secondary">{selectedMethod.settlementTime}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Min Amount</p>
                  <p className="font-medium">{selectedMethod.minAmount} EGP</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max Amount</p>
                  <p className="font-medium">{selectedMethod.maxAmount.toLocaleString()} EGP</p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>Withdrawal Amount (EGP)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={`Enter amount (${selectedMethod.minAmount} - ${Math.min(selectedMethod.maxAmount, wallet?.egpBalance || 0).toLocaleString()})`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EGP</div>
              </div>
            </div>

            {/* Dynamic Form Fields */}
            {selectedMethod.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.type === "select" ? (
                  <Select onValueChange={(value) => handleFormDataChange(field.name, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleFormDataChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Withdraw Button */}
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    if (validateForm()) {
                      setShowConfirmation(true)
                    }
                  }}
                  className="w-full"
                  disabled={!amount || Number.parseFloat(amount) <= 0}
                >
                  Withdraw {amount ? Number.parseFloat(amount).toLocaleString() : ""} EGP
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Confirm Withdrawal
                  </DialogTitle>
                  <DialogDescription>
                    Please verify your withdrawal details and enter the OTP code sent to your phone.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Withdrawal Summary */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">{amount} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-medium">{selectedMethod?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="font-medium">{selectedMethod?.settlementTime}</span>
                    </div>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <Label>Enter OTP Code</Label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground">
                      We sent a 6-digit code to your registered phone number
                    </p>
                  </div>

                  {/* Security Warning */}
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Make sure your withdrawal details are correct. This action cannot be undone.
                    </AlertDescription>
                  </Alert>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Confirm Button */}
                  <Button onClick={handleWithdraw} disabled={loading || !otpCode} className="w-full">
                    {loading ? "Processing..." : "Confirm Withdrawal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}
