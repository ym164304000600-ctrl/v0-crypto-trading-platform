"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowUpRight, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods"

export function WithdrawForm() {
  const { user } = useAuth()
  const { wallet } = useWallet()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showDialog, setShowDialog] = useState(false)

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
      setShowDialog(false)
    } catch (err: any) {
      setError(err.message || "Failed to submit withdrawal")
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
              Your withdrawal request has been submitted and is under review. Funds will be transferred once approved.
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
        {/* Balance */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="text-2xl font-bold text-primary">
              {wallet?.egpBalance.toLocaleString() || 0} EGP
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <Label>Select Withdrawal Method</Label>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.filter((m) => m.isActive).map((method) => (
              <Button
                key={method.id}
                type="button"
                variant={selectedMethod?.id === method.id ? "default" : "outline"}
                onClick={() => handleMethodSelect(method.id)}
                className="flex items-center gap-2"
              >
                {method.icon}
                {method.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Method Details */}
        {selectedMethod && (
          <>
            <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{selectedMethod.name}</h4>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedMethod.settlementTime}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedMethod.instructions}</p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount (EGP)</Label>
              <Input
                type="number"
                placeholder={`Min ${selectedMethod.minAmount}, Max ${selectedMethod.maxAmount}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Dynamic Fields */}
            {selectedMethod.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleFormDataChange(field.name, e.target.value)}
                />
              </div>
            ))}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <Button
                className="w-full"
                onClick={() => {
                  if (validateForm()) setShowDialog(true)
                }}
              >
                Withdraw {amount ? Number(amount).toLocaleString() : ""} EGP
              </Button>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Withdrawal</DialogTitle>
                  <DialogDescription>
                    Please confirm your withdrawal request. Once submitted, it will be reviewed by our team.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p><strong>Amount:</strong> {amount} EGP</p>
                    <p><strong>Method:</strong> {selectedMethod.name}</p>
                    <p><strong>Processing:</strong> {selectedMethod.settlementTime}</p>
                  </div>

                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Make sure details are correct. This request cannot be cancelled once submitted.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleWithdraw} disabled={loading} className="w-full">
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
