// Real trading service for buy/sell operations
import { firebaseService } from "@/lib/firebase-service"
import { cryptoAPI } from "@/lib/api/crypto-api"
import type { Wallet } from "@/lib/types"

export interface TradeOrder {
  userId: string
  type: "buy" | "sell"
  cryptoSymbol: string
  amount: number
  price: number
  total: number
}

export class TradingService {
  async executeTrade(order: TradeOrder): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Get current wallet
      const wallet = await firebaseService.getWallet(order.userId)
      if (!wallet) {
        return { success: false, error: "Wallet not found" }
      }

      // Get current prices
      const prices = await cryptoAPI.getCurrentPrices()
      const currentPrice = prices[order.cryptoSymbol]?.price

      if (!currentPrice) {
        return { success: false, error: "Price data not available" }
      }

      // Validate trade
      if (order.type === "buy") {
        // Check if user has enough EGP balance
        if (wallet.egpBalance < order.total) {
          return { success: false, error: "Insufficient EGP balance" }
        }

        // Update balances
        const newEgpBalance = wallet.egpBalance - order.total
        const cryptoField = `${order.cryptoSymbol.toLowerCase()}Balance` as keyof Wallet
        const currentCryptoBalance = (wallet[cryptoField] as number) || 0
        const newCryptoBalance = currentCryptoBalance + order.amount

        // Update wallet balances
        await firebaseService.updateWalletBalance(order.userId, "egp", newEgpBalance)
        await firebaseService.updateWalletBalance(order.userId, order.cryptoSymbol.toLowerCase(), newCryptoBalance)
      } else {
        // sell
        // Check if user has enough crypto balance
        const cryptoField = `${order.cryptoSymbol.toLowerCase()}Balance` as keyof Wallet
        const currentCryptoBalance = (wallet[cryptoField] as number) || 0

        if (currentCryptoBalance < order.amount) {
          return { success: false, error: `Insufficient ${order.cryptoSymbol} balance` }
        }

        // Update balances
        const newCryptoBalance = currentCryptoBalance - order.amount
        const newEgpBalance = wallet.egpBalance + order.total

        // Update wallet balances
        await firebaseService.updateWalletBalance(order.userId, order.cryptoSymbol.toLowerCase(), newCryptoBalance)
        await firebaseService.updateWalletBalance(order.userId, "egp", newEgpBalance)
      }

      // Record transaction
      const transactionId = await firebaseService.addTransaction({
        userId: order.userId,
        type: order.type,
        cryptoSymbol: order.cryptoSymbol,
        amount: order.amount,
        price: order.price,
        total: order.total,
        status: "completed",
        fees: order.total * 0.001, // 0.1% fee
      })

      return { success: true, transactionId }
    } catch (error) {
      console.error("Trade execution error:", error)
      return { success: false, error: "Trade execution failed" }
    }
  }

  calculateTradingFee(total: number): number {
    return total * 0.001 // 0.1% trading fee
  }

  validateTradeAmount(amount: number, minAmount = 0.0001): boolean {
    return amount >= minAmount && amount > 0
  }

  validateTradeTotal(total: number, minTotal = 50): boolean {
    return total >= minTotal // Minimum 50 EGP trade
  }
}

export const tradingService = new TradingService()
