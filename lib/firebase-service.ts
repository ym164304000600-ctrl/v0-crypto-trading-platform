// Real Firebase service for user data and wallet management
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, Wallet, Transaction } from "@/lib/types"

export class FirebaseService {
  // User management
  async createUser(uid: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, "users", uid)
    await setDoc(userRef, {
      ...userData,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      kycStatus: "pending",
      level: "bronze",
      totalTradingVolume: 0,
    })
  }

  async getUser(uid: string): Promise<User | null> {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User
    }

    return null
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  }

  // Wallet management
  async createWallet(userId: string): Promise<Wallet> {
    const walletRef = doc(db, "wallets", userId)
    const newWallet: Wallet = {
      userId,
      egpBalance: 0,
      btcBalance: 0,
      ethBalance: 0,
      usdtBalance: 0,
      bonusBalance: 0,
      updatedAt: new Date(),
    }

    await setDoc(walletRef, {
      ...newWallet,
      updatedAt: serverTimestamp(),
    })

    return newWallet
  }

  async getWallet(userId: string): Promise<Wallet | null> {
    const walletRef = doc(db, "wallets", userId)
    const walletSnap = await getDoc(walletRef)

    if (walletSnap.exists()) {
      const data = walletSnap.data()
      return {
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Wallet
    }

    return null
  }

  async updateWalletBalance(userId: string, currency: string, amount: number): Promise<void> {
    const walletRef = doc(db, "wallets", userId)
    const field = `${currency.toLowerCase()}Balance`

    await updateDoc(walletRef, {
      [field]: amount,
      updatedAt: serverTimestamp(),
    })
  }

  // Transaction management
  async addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<string> {
    const transactionsRef = collection(db, "transactions")
    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      createdAt: serverTimestamp(),
    })

    return docRef.id
  }

  async getUserTransactions(userId: string, limitCount = 10): Promise<Transaction[]> {
    const transactionsRef = collection(db, "transactions")
    const q = query(transactionsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(limitCount))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Transaction[]
  }
}

export const firebaseService = new FirebaseService()
