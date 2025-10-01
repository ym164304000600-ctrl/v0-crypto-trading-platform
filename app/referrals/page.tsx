"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Gift, Copy, Share, CheckCircle } from "lucide-react"

export default function ReferralsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const referralCode = "CRYPTO2024"
  const referralLink = `https://cryptoegypt.com/register?ref=${referralCode}`

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 600,
    pendingEarnings: 150,
  }

  const recentReferrals = [
    {
      id: 1,
      name: "Ahmed Hassan",
      joinDate: "2024-03-15",
      status: "active",
      earnings: 50,
    },
    {
      id: 2,
      name: "Sara Mohamed",
      joinDate: "2024-03-10",
      status: "active",
      earnings: 50,
    },
    {
      id: 3,
      name: "Omar Ali",
      joinDate: "2024-03-08",
      status: "pending",
      earnings: 0,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Referral Program</h1>
                <p className="text-muted-foreground">Earn 50 EGP for each successful referral</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralStats.activeReferrals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralStats.totalEarnings} EGP</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralStats.pendingEarnings} EGP</div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="flex-1" />
                  <Button onClick={() => copyToClipboard(referralLink)} variant="outline">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button onClick={() => copyToClipboard(referralLink)}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2">How it works:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Share your referral link with friends</li>
                    <li>• They sign up and complete KYC verification</li>
                    <li>• You earn 50 EGP when they make their first deposit</li>
                    <li>• No limit on referrals - earn unlimited rewards!</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {referral.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold">{referral.name}</h3>
                          <p className="text-sm text-muted-foreground">Joined {referral.joinDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant={referral.status === "active" ? "secondary" : "outline"}>
                          {referral.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">{referral.earnings} EGP</p>
                          <p className="text-sm text-muted-foreground">Earned</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
