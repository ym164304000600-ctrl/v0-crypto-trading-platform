"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_METHODS, calculateFee, type PaymentMethod } from "@/lib/payment-methods"
import { useAuth } from "@/contexts/auth-context"
import { addDoc, collection } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { ArrowDownLeft, Upload, Clock, FileText, CheckCircle } from "lucide-react"

export function DepositForm() {
  const { user } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [receipt, setReceipt] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [transactionCode, setTransactionCode] = useState<string | null>(null)

  const handleMethodSelect = (methodId: string) => {
    const method = PAYMENT_METHODS.find((m) => m.id === methodId)
    setSelectedMethod(method || null)
    setFormData({})
    setAmount("")
    setReceipt(null)
    setError("")
    setTransactionCode(null) // Reset transaction code when method changes
  }

  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (file: File | null) => {
    setReceipt(file)
  }

  const validateForm = (): boolean => {
    if (!selectedMethod || !amount || !user) return false

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount < selectedMethod.minAmount || numAmount > selectedMethod.maxAmount) {
      setError(`Amount must be between ${selectedMethod.minAmount} and ${selectedMethod.maxAmount} EGP`)
      return false
    }

    // Validate required fields
    for (const field of selectedMethod.fields) {
      if (field.required && !formData[field.name]) {
        setError(`Please fill in ${field.label}`)
        return false
      }
    }

    if (!receipt && selectedMethod.type !== "card") {
      setError("Please upload a receipt")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      let receiptUrl = ""

      // Upload receipt if provided
      if (receipt) {
        const receiptRef = ref(storage, `deposits/${user!.uid}/${Date.now()}_${receipt.name}`)
        const snapshot = await uploadBytes(receiptRef, receipt)
        receiptUrl = await getDownloadURL(snapshot.ref)
      }

      // Generate transaction code (for example, a random code or timestamp)
      const code = `TXN-${Date.now()}` 
      setTransactionCode(code)

      // Create deposit record
      await addDoc(collection(db, "transactions"), {
        userId: user!.uid,
        type: "deposit",
        amount: Number.parseFloat(amount),
        currency: "EGP",
        paymentMethodId: selectedMethod!.id,
        paymentMethodName: selectedMethod!.name,
        formData,
        receiptUrl,
        fee: calculateFee(Number.parseFloat(amount), selectedMethod!),
        status: "pending",
        transactionCode: code,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "Failed to submit deposit")
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
          <CardTitle>Deposit Submitted Successfully</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Alert>
            <AlertDescription>
              Your deposit request has been submitted and is being processed. You'll receive a notification once it's approved.
            </AlertDescription>
          </Alert>
          <p className="font-medium">Transaction Code: {transactionCode}</p>
          <Button onClick={() => setSuccess(false)} variant="outline">
            Make Another Deposit
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownLeft className="w-5 h-5" />
          Deposit Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label>Select Payment Method</Label>
          <Select onValueChange={handleMethodSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a payment method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.filter((method) => method.isActive).map((method) => (
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
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedMethod.settlementTime}
                </Badge>
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
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium">
                    {selectedMethod.feeType === "fixed" ? `${selectedMethod.fee} EGP` : `${selectedMethod.fee}%`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedMethod.type.replace("_", " ")}</p>
                </div>
              </div>

              <Alert>
                <FileText className="w-4 h-4" />
                <AlertDescription>{selectedMethod.instructions}</AlertDescription>
              </Alert>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>Deposit Amount (EGP)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={`Enter amount (${selectedMethod.minAmount} - ${selectedMethod.maxAmount.toLocaleString()})`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EGP</div>
              </div>

              {amount && Number.parseFloat(amount) > 0 && (
                <div className="text-sm text-muted-foreground">
                  Fee: {calculateFee(Number.parseFloat(amount), selectedMethod).toFixed(2)} EGP • Total:{" "}
                  {(Number.parseFloat(amount) + calculateFee(Number.parseFloat(amount), selectedMethod)).toFixed(2)} EGP
                </div>
              )}
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

            {/* Receipt Upload */}
            {selectedMethod.type !== "card" && (
              <div className="space-y-2">
                <Label>
                  Upload Receipt <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                  {receipt && <p className="text-sm text-muted-foreground mt-2">{receipt.name}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Upload image or PDF of your payment receipt</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Processing..." : `Deposit ${amount ? Number.parseFloat(amount).toLocaleString() : ""} EGP`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
