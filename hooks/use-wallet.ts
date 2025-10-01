"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { firebaseService } from "@/lib/firebase-service"
import { cryptoAPI } from "@/lib/api/crypto-api"
import type { Wallet, CryptoPrice } from "@/lib/types"

export function useWallet() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const loadWallet = async () => {
      try {
        const walletData = await firebaseService.getWallet(user.uid)
        if (walletData) {
          setWallet(walletData)
        } else {
          // Create new wallet if doesn't exist
          const newWallet = await firebaseService.createWallet(user.uid)
          setWallet(newWallet)
        }
      } catch (error) {
        console.error("[v0] Error loading wallet:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWallet()
  }, [user])

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const realPrices = await cryptoAPI.getCurrentPrices()
        setPrices(realPrices)
        console.log("[v0] Real crypto prices loaded:", realPrices)
      } catch (error) {
        console.error("[v0] Error loading crypto prices:", error)
      }
    }

    loadPrices()

    // Update prices every 30 seconds
    const interval = setInterval(loadPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateBalance = async (currency: string, amount: number) => {
    if (!user || !wallet) return

    try {
      await firebaseService.updateWalletBalance(user.uid, currency, amount)

      // Update local state
      const field = `${currency.toLowerCase()}Balance` as keyof Wallet
      const updatedWallet = {
        ...wallet,
        [field]: amount,
        updatedAt: new Date(),
      }
      setWallet(updatedWallet)

      console.log(`[v0] Balance updated: ${currency} = ${amount}`)
    } catch (error) {
      console.error("[v0] Error updating balance:", error)
    }
  }

  const getTotalValueInEGP = () => {
    if (!wallet) return 0

    const btcValue = wallet.btcBalance * (prices.BTC?.price || 0)
    const ethValue = wallet.ethBalance * (prices.ETH?.price || 0)
    const usdtValue = wallet.usdtBalance * (prices.USDT?.price || 0)

    return wallet.egpBalance + btcValue + ethValue + usdtValue + wallet.bonusBalance
  }

  const getTotalValueInUSD = () => {
    return getTotalValueInEGP() / 49.5 // EGP to USD rate
  }

  return {
    wallet,
    prices,
    loading,
    updateBalance,
    getTotalValueInEGP,
    getTotalValueInUSD,
  }
}
