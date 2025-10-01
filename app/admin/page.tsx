"use client"

import { AdminNavigation } from "@/components/admin/admin-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CreditCard, Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Pending KYC",
      value: "23",
      change: "-5%",
      icon: Shield,
      color: "text-orange-500",
    },
    {
      title: "Daily Volume",
      value: "₹2.4M",
      change: "+18%",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Pending Withdrawals",
      value: "₹45K",
      change: "+3%",
      icon: CreditCard,
      color: "text-purple-500",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "kyc_approval",
      user: "Ahmed Hassan",
      action: "KYC Approved",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "withdrawal",
      user: "Sara Mohamed",
      action: "Withdrawal Request - ₹5,000",
      time: "5 minutes ago",
      status: "pending",
    },
    {
      id: 3,
      type: "deposit",
      user: "Omar Ali",
      action: "Deposit Confirmed - ₹10,000",
      time: "12 minutes ago",
      status: "success",
    },
    {
      id: 4,
      type: "kyc_rejection",
      user: "Fatima Ibrahim",
      action: "KYC Rejected - Invalid Document",
      time: "25 minutes ago",
      status: "error",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform overview and management</p>
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                          {stat.change}
                        </span>{" "}
                        from last month
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {activity.status === "pending" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                          {activity.status === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "secondary"
                              : activity.status === "pending"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
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
