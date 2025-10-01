"use client"

import { useState } from "react"
import { AdminNavigation } from "@/components/admin/admin-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreHorizontal, Ban, CheckCircle, AlertCircle } from "lucide-react"

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")

  const users = [
    {
      id: 1,
      name: "Ahmed Hassan",
      email: "ahmed.hassan@email.com",
      phone: "+201012345678",
      kycStatus: "verified",
      accountStatus: "active",
      balance: "₹15,420",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Sara Mohamed",
      email: "sara.mohamed@email.com",
      phone: "+201087654321",
      kycStatus: "pending",
      accountStatus: "active",
      balance: "₹8,750",
      joinDate: "2024-02-20",
      lastActive: "1 day ago",
    },
    {
      id: 3,
      name: "Omar Ali",
      email: "omar.ali@email.com",
      phone: "+201098765432",
      kycStatus: "rejected",
      accountStatus: "suspended",
      balance: "₹2,100",
      joinDate: "2024-01-08",
      lastActive: "5 days ago",
    },
    {
      id: 4,
      name: "Fatima Ibrahim",
      email: "fatima.ibrahim@email.com",
      phone: "+201023456789",
      kycStatus: "verified",
      accountStatus: "active",
      balance: "₹32,890",
      joinDate: "2023-12-10",
      lastActive: "30 minutes ago",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm),
  )

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <Ban className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary">Active</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage user accounts and KYC status</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{user.balance}</p>
                        <p className="text-sm text-muted-foreground">Balance</p>
                      </div>

                      <div className="flex flex-col gap-1">
                        {getKycBadge(user.kycStatus)}
                        {getStatusBadge(user.accountStatus)}
                      </div>

                      <div className="text-right">
                        <p className="text-sm">{user.lastActive}</p>
                        <p className="text-xs text-muted-foreground">Last active</p>
                      </div>

                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
