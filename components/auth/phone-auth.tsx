"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { ConfirmationResult } from "firebase/auth"

interface PhoneAuthProps {
  onSuccess: () => void
}

export function PhoneAuth({ onSuccess }: PhoneAuthProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const { sendPhoneVerification, verifyPhoneCode } = useAuth()

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a valid phone number")
      return
    }

    // Format phone number for Egypt (+20)
    const formattedPhone = phoneNumber.startsWith("+20") ? phoneNumber : `+20${phoneNumber.replace(/^0/, "")}`

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Sending OTP to:", formattedPhone)
      const result = await sendPhoneVerification(formattedPhone)
      setConfirmationResult(result)
      setStep("otp")
      console.log("[v0] OTP sent successfully")
    } catch (error: any) {
      setError(error.message || "Failed to send OTP")
      console.log("[v0] OTP send error:", error)
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp.trim() || !confirmationResult) {
      setError("Please enter the OTP code")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Verifying OTP:", otp)
      await verifyPhoneCode(confirmationResult, otp)
      onSuccess()
      console.log("[v0] OTP verification successful")
    } catch (error: any) {
      setError(error.message || "Invalid OTP code")
      console.log("[v0] OTP verification error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (step === "phone") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Phone Verification</CardTitle>
          <CardDescription>Enter your Egyptian phone number to receive a verification code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex">
              <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">
                +20
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="1012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="rounded-l-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>

          <Button onClick={sendOTP} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Verification Code
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>Enter the 6-digit code sent to your phone</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            disabled={loading}
            className="text-center text-lg tracking-widest"
          />
        </div>

        <Button onClick={verifyOTP} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Code
        </Button>

        <Button variant="ghost" onClick={() => setStep("phone")} className="w-full" disabled={loading}>
          Change Phone Number
        </Button>
      </CardContent>
    </Card>
  )
}
