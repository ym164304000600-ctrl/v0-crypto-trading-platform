"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Transaction } from "@/lib/types"
import { ArrowUpRight, ArrowDownLeft, Search, Download } from "lucide-react"

export function TransactionHistory() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Transaction[]

      setTransactions(transactionData)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.paymentMethodId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, statusFilter, typeFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-accent/10 text-accent">Completed</Badge>
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-accent" />
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-orange-500" />
      default:
        return <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
    }
  }

  const exportTransactions = () => {
    const csvContent = [
      ["Date", "Type", "Amount", "Currency", "Method", "Status", "ID"].join(","),
      ...filteredTransactions.map((tx) =>
        [
          tx.createdAt?.toLocaleDateString(),
          tx.type,
          tx.amount,
          tx.currency,
          tx.paymentMethodId || "",
          tx.status,
          tx.id,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button onClick={exportTransactions} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({filteredTransactions.length})</TabsTrigger>
            <TabsTrigger value="deposits">
              Deposits ({filteredTransactions.filter((tx) => tx.type === "deposit").length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              Withdrawals ({filteredTransactions.filter((tx) => tx.type === "withdrawal").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions found</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.paymentMethodId?.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {transaction.type === "withdrawal" ? "-" : "+"}
                        {transaction.amount.toLocaleString()} {transaction.currency}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>ID: {transaction.id.slice(-8)}</span>
                    <span>{transaction.createdAt?.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="deposits" className="space-y-4">
            {filteredTransactions
              .filter((tx) => tx.type === "deposit")
              .map((transaction) => (
                <div key={transaction.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Deposit</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.paymentMethodId?.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-accent">
                        +{transaction.amount.toLocaleString()} {transaction.currency}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>ID: {transaction.id.slice(-8)}</span>
                    <span>{transaction.createdAt?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-4">
            {filteredTransactions
              .filter((tx) => tx.type === "withdrawal")
              .map((transaction) => (
                <div key={transaction.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">Withdrawal</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.paymentMethodId?.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-orange-500">
                        -{transaction.amount.toLocaleString()} {transaction.currency}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>ID: {transaction.id.slice(-8)}</span>
                    <span>{transaction.createdAt?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
