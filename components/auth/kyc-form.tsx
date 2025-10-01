"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Upload, FileText, Camera, CheckCircle } from "lucide-react"

export function KYCForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    nationality: "Egyptian",
    address: "",
    city: "",
    postalCode: "",
    idType: "national_id",
    idNumber: "",
  })

  const [files, setFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validate required fields
    const requiredFields = ["fullName", "dateOfBirth", "address", "city", "idNumber"]
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
        return
      }
    }

    if (!files.idFront || !files.idBack || !files.selfie) {
      setError("Please upload all required documents")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Demo KYC submission:", formData)
      console.log(
        "[v0] Demo files uploaded:",
        Object.keys(files).filter((key) => files[key as keyof typeof files]),
      )

      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSuccess(true)
      console.log("[v0] Demo KYC submitted successfully")
    } catch (error: any) {
      setError("Failed to submit KYC documents")
      console.log("[v0] Demo KYC submission error:", error)
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
          <CardTitle>KYC Submitted Successfully</CardTitle>
          <CardDescription>Demo Mode - Your documents are automatically approved!</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              In demo mode, KYC verification is instant. You now have full access to all trading features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification (KYC)</CardTitle>
        <CardDescription>Demo Mode - Complete verification to unlock full trading features</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Ahmed Mohamed Ali"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Tahrir Square, Downtown"
                disabled={loading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Cairo"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="11511"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* ID Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ID Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idType">ID Type</Label>
                <Select value={formData.idType} onValueChange={(value) => handleInputChange("idType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange("idNumber", e.target.value)}
                  placeholder="29912345678901"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Document Upload</h3>
            <p className="text-sm text-muted-foreground">Demo Mode - Any image files will work</p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ID Front</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("idFront", e.target.files?.[0] || null)}
                    className="hidden"
                    id="idFront"
                  />
                  <Label htmlFor="idFront" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </Label>
                  {files.idFront && <p className="text-sm text-muted-foreground mt-2">{files.idFront.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>ID Back</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("idBack", e.target.files?.[0] || null)}
                    className="hidden"
                    id="idBack"
                  />
                  <Label htmlFor="idBack" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </Label>
                  {files.idBack && <p className="text-sm text-muted-foreground mt-2">{files.idBack.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selfie</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("selfie", e.target.files?.[0] || null)}
                    className="hidden"
                    id="selfie"
                  />
                  <Label htmlFor="selfie" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </Label>
                  {files.selfie && <p className="text-sm text-muted-foreground mt-2">{files.selfie.name}</p>}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Verification
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
