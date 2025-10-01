"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { db } from "@/lib/firebase"
import { addDoc, collection } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import {
  Smartphone,
  Building2,
  Landmark,
  CreditCard,
  Wifi,
  Zap,
  CheckCircle,
  ArrowDownLeft
} from "lucide-react"

type Method = "vodafone" | "etisalat" | "instapay" | "fawry" | "bank" | "visa"

export function DepositForm() {
  const { user } = useAuth()
  const [method, setMethod] = useState<Method | null>(null)
  const [amount, setAmount] = useState("")
  const [fromNumber, setFromNumber] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "deposit",
        method,
        amount: parseFloat(amount),
        fromNumber,
        status: "pending",
        createdAt: new Date()
      })
      setSuccess(true)
      setAmount("")
      setFromNumber("")
      setMethod(null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-accent shadow-lg">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="text-green-600 w-8 h-8" />
          </div>
          <CardTitle>Deposit Under Review</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Your deposit request has been submitted and is pending approval.
          </p>
          <Button variant="outline" onClick={() => setSuccess(false)}>
            Make Another Deposit
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownLeft className="w-5 h-5 text-accent" />
          Deposit Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* اختيار وسيلة الدفع */}
        <div className="space-y-2">
          <Label>Choose Payment Method</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={method === "vodafone" ? "default" : "outline"}
              onClick={() => setMethod("vodafone")}
              className="flex items-center gap-2"
            >
              <Smartphone className="text-red-500 w-5 h-5" />
              Vodafone Cash
            </Button>
            <Button
              type="button"
              variant={method === "etisalat" ? "default" : "outline"}
              onClick={() => setMethod("etisalat")}
              className="flex items-center gap-2"
            >
              <Smartphone className="text-green-500 w-5 h-5" />
              Etisalat Cash
            </Button>
            <Button
              type="button"
              variant={method === "instapay" ? "default" : "outline"}
              onClick={() => setMethod("instapay")}
              className="flex items-center gap-2"
            >
              <Wifi className="text-purple-500 w-5 h-5" />
              InstaPay
            </Button>
            <Button
              type="button"
              variant={method === "fawry" ? "default" : "outline"}
              onClick={() => setMethod("fawry")}
              className="flex items-center gap-2"
            >
              <Zap className="text-yellow-500 w-5 h-5" />
              Fawry
            </Button>
            <Button
              type="button"
              variant={method === "bank" ? "default" : "outline"}
              onClick={() => setMethod("bank")}
              className="flex items-center gap-2"
            >
              <Building2 className="text-blue-500 w-5 h-5" />
              Bank Transfer
            </Button>
            <Button
              type="button"
              variant={method === "visa" ? "default" : "outline"}
              onClick={() => setMethod("visa")}
              className="flex items-center gap-2"
            >
              <Landmark className="text-pink-500 w-5 h-5" />
              Visa / Mastercard
            </Button>
          </div>
        </div>

        {/* تفاصيل الدفع */}
        {method && (
          <div className="p-4 border rounded-lg bg-muted/40 space-y-2">
            {method === "vodafone" && (
              <>
                <p className="font-semibold">Vodafone Cash Number:</p>
                <p className="text-red-500 font-bold">01149923748</p>
              </>
            )}
            {method === "etisalat" && (
              <>
                <p className="font-semibold">Etisalat Cash Number:</p>
                <p className="text-green-500 font-bold">01149923748</p>
              </>
            )}
            {method === "instapay" && (
              <>
                <p className="font-semibold">InstaPay ID:</p>
                <p className="text-purple-500 font-bold">wallet@bank.com</p>
              </>
            )}
            {method === "fawry" && (
              <>
                <p className="font-semibold">Fawry Reference Code:</p>
                <p className="text-yellow-600 font-bold">01149923748</p>
              </>
            )}
            {method === "bank" && (
              <>
                <p className="font-semibold">Bank Account:</p>
                <p className="text-blue-600 font-bold">CIB - 1234 5678 9012 3456</p>
              </>
            )}
            {method === "visa" && (
              <>
                <p className="font-semibold">Payment Link:</p>
                <p className="text-pink-600 underline cursor-pointer">
                  pay.example.com/checkout
                </p>
              </>
            )}
            <p className="text-sm text-muted-foreground">
              Please send the payment, then fill in the form below.
            </p>
          </div>
        )}

        {/* الفورم */}
        {method && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>From Number</Label>
              <Input
                type="text"
                placeholder="Enter the number you paid from"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (EGP)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Submit Deposit"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
