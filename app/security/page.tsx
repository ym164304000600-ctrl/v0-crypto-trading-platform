"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle } from "lucide-react"

export default function SecurityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const securitySettings = {
    passwordLastChanged: "2024-02-15",
    twoFactorAuth: false,
    biometricAuth: true,
    loginNotifications: true,
    deviceTrust: true,
  }

  const recentActivity = [
    {
      id: 1,
      action: "Login",
      device: "iPhone 15 Pro",
      location: "Cairo, Egypt",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      action: "Password Change",
      device: "MacBook Pro",
      location: "Cairo, Egypt",
      time: "3 days ago",
      status: "success",
    },
    {
      id: 3,
      action: "Failed Login Attempt",
      device: "Unknown Device",
      location: "Alexandria, Egypt",
      time: "1 week ago",
      status: "warning",
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
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Security Settings</h1>
                <p className="text-muted-foreground">Manage your account security and privacy</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Security Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Account Verified</p>
                      <p className="text-sm text-muted-foreground">KYC completed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold">2FA Disabled</p>
                      <p className="text-sm text-muted-foreground">Enable for better security</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Strong Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed: {securitySettings.passwordLastChanged}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={twoFactorEnabled ? "secondary" : "outline"}>
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                  </div>
                </div>

                {/* Biometric Authentication */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Biometric Authentication</p>
                      <p className="text-sm text-muted-foreground">Use fingerprint or face recognition</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={biometricEnabled ? "secondary" : "outline"}>
                      {biometricEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.status === "success"
                              ? "bg-green-500/10"
                              : activity.status === "warning"
                                ? "bg-orange-500/10"
                                : "bg-red-500/10"
                          }`}
                        >
                          {activity.status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {activity.status === "warning" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                          {activity.status === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </div>
                        <div>
                          <p className="font-semibold">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.device} • {activity.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
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
