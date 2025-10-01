export interface User {
  uid: string
  email?: string
  phoneNumber?: string
  displayName?: string
  photoURL?: string
  kycStatus: "pending" | "verified" | "rejected"
  createdAt: Date
  updatedAt: Date
  referralCode?: string
  referredBy?: string
  level: "bronze" | "silver" | "gold"
  totalTradingVolume: number
}

export interface Wallet {
  userId: string
  egpBalance: number
  btcBalance: number
  ethBalance: number
  usdtBalance: number
  bonusBalance: number
  updatedAt: Date
}

export interface PaymentMethod {
  id: string
  name: string
  type: "mobile_wallet" | "bank_transfer" | "card" | "fawry"
  minAmount: number
  maxAmount: number
  fee: number
  settlementTime: string
  instructions: string
  isActive: boolean
}

export interface Transaction {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "buy" | "sell" | "swap"
  amount: number
  cryptoSymbol?: string // For crypto trades
  price?: number // Price per unit for crypto trades
  total: number // Total value in EGP
  fees?: number // Trading fees
  status: "pending" | "completed" | "failed" | "cancelled"
  paymentMethodId?: string
  receiptUrl?: string
  createdAt: Date
  updatedAt?: Date
}

export interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  type: "market" | "limit" | "stop"
  side: "buy" | "sell"
  symbol: string
  amount: number
  price?: number
  stopPrice?: number
  status: "pending" | "filled" | "cancelled"
  createdAt: Date
}
