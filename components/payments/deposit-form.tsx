"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { addDoc, collection } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Smartphone, Building2, Landmark, Wifi, Zap, CheckCircle, ArrowDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type Method = "vodafone" | "etisalat" | "instapay" | "fawry" | "bank" | "visa"

const paymentMethods: {
  id: Method
  label: string
  color: string
  icon: any
}[] = [
  { id: "vodafone", label: "Vodafone Cash", color: "text-red-500", icon: Smartphone },
  { id: "etisalat", label: "Etisalat Cash", color: "text-green-500", icon: Smartphone },
  { id: "instapay", label: "InstaPay", color: "text-purple-500", icon: Wifi },
  { id: "fawry", label: "Fawry", color: "text-yellow-500", icon: Zap },
  { id: "bank", label: "Bank Transfer", color: "text-blue-500", icon: Building2 },
  { id: "visa", label: "Visa / Mastercard", color: "text-pink-500", icon: Landmark },
]

export function DepositForm() {
  const { user } = useAuth()
  const [method, setMethod] = useState<Method | null>(null)
  const [amount, setAmount] = useState("")
  const [fromNumber, setFromNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login first to submit a deposit.",
      })
      return
    }

    if (!method) {
      toast({
        variant: "destructive",
        title: "Choose Payment Method",
        description: "Please select a payment method to continue.",
      })
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "deposit",
        method,
        amount: Number.parseFloat(amount),
        fromNumber,
        status: "pending",
        createdAt: new Date(),
      })
      setSuccess(true)
      setAmount("")
      setFromNumber("")
      setMethod(null)
      toast({
        title: "Deposit Submitted",
        description: "Your deposit request is pending approval.",
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit deposit. Try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Card className="w-full max-w-lg border-slate-700/40 bg-slate-900/80 text-slate-100 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center border-b border-slate-700 pb-4">
          <div className="flex flex-col items-center gap-2">
            <ArrowDownLeft className="w-8 h-8 text-blue-400" />
            <CardTitle className="text-2xl font-semibold text-white">Deposit Funds</CardTitle>
            <p className="text-sm text-slate-400">Choose your preferred payment method and fill the form below</p>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-400">Deposit Under Review</h3>
              <p className="text-slate-400">Your deposit has been submitted and is pending approval.</p>
              <Button variant="secondary" onClick={() => setSuccess(false)} className="mt-2">
                Make Another Deposit
              </Button>
            </div>
          ) : (
            <>
              {/* اختيار وسيلة الدفع */}
              <div className="space-y-3">
                <Label className="font-semibold text-slate-200">Choose Payment Method</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((m) => {
                    const Icon = m.icon
                    return (
                      <div
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.03]",
                          method === m.id ? "border-blue-400 bg-blue-500/10" : "border-slate-700 hover:bg-slate-800/60",
                        )}
                      >
                        <Icon className={cn(m.color, "w-6 h-6 mb-1")} />
                        <span className="text-sm font-medium text-slate-200">{m.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* تفاصيل الدفع */}
              {method && (
                <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 space-y-2">
                  <p className="font-semibold text-slate-200">Payment Info:</p>
                  {method === "vodafone" && <p className="text-red-400 font-bold">Vodafone Cash: 01015759067</p>}
                  {method === "etisalat" && <p className="text-green-400 font-bold">Etisalat Cash: 01015759067</p>}
                  {method === "instapay" && <p className="text-purple-400 font-bold">InstaPay ID: wallet@bank.com</p>}
                  {method === "fawry" && <p className="text-yellow-400 font-bold">Fawry Code: 01015759067</p>}
                  {method === "bank" && <p className="text-blue-400 font-bold">CIB Account: 1234 5678 9012 3456</p>}
                  {method === "visa" && (
                    <a
                      href="https://pay.example.com/checkout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 underline font-medium"
                    >
                      pay.example.com/checkout
                    </a>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    Please complete the payment before submitting this form.
                  </p>
                </div>
              )}

              {/* الفورم */}
              {method && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">From Number</Label>
                    <Input
                      type="text"
                      placeholder="Enter the number you paid from"
                      className="bg-slate-800 border-slate-700 text-white"
                      value={fromNumber}
                      onChange={(e) => setFromNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-200">Amount (EGP)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      className="bg-slate-800 border-slate-700 text-white"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  >
                    {loading ? "Processing..." : "Submit Deposit"}
                  </Button>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
