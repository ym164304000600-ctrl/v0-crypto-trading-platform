"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { firebaseService } from "@/lib/firebase-service"
import type { Transaction } from "@/lib/types"

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    const loadTransactions = async () => {
      try {
        setLoading(true)
        const userTransactions = await firebaseService.getUserTransactions(user.uid, 10)
        setTransactions(userTransactions)
        setError(null)
      } catch (err) {
        console.error("[v0] Error loading transactions:", err)
        setError("Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [user])

  const refreshTransactions = async () => {
    if (!user) return

    try {
      const userTransactions = await firebaseService.getUserTransactions(user.uid, 10)
      setTransactions(userTransactions)
      setError(null)
    } catch (err) {
      console.error("[v0] Error refreshing transactions:", err)
      setError("Failed to refresh transactions")
    }
  }

  return {
    transactions,
    loading,
    error,
    refreshTransactions,
  }
}
