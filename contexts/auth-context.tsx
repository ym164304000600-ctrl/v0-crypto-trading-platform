"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { firebaseService } from "@/lib/firebase-service"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  logout: () => Promise<void>
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  sendPhoneVerification: (phoneNumber: string) => Promise<ConfirmationResult>
  verifyPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[v0] Auth state changed:", firebaseUser?.uid)
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        let userData = await firebaseService.getUser(firebaseUser.uid)

        if (!userData) {
          // Create new user if doesn't exist
          await firebaseService.createUser(firebaseUser.uid, {
            email: firebaseUser.email || undefined,
            phoneNumber: firebaseUser.phoneNumber || undefined,
            displayName: firebaseUser.displayName || "New User",
            photoURL: firebaseUser.photoURL || undefined,
          })
          userData = await firebaseService.getUser(firebaseUser.uid)
        }

        setUser(userData)

        // Create wallet if doesn't exist
        const wallet = await firebaseService.getWallet(firebaseUser.uid)
        if (!wallet) {
          await firebaseService.createWallet(firebaseUser.uid)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await firebaseService.createUser(userCredential.user.uid, {
      email,
      displayName,
    })
  }

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const sendPhoneVerification = async (phoneNumber: string): Promise<ConfirmationResult> => {
    // Initialize reCAPTCHA
    if (!(window as any).recaptchaVerifier) {
      ;(window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("[v0] reCAPTCHA solved")
        },
      })
    }

    const appVerifier = (window as any).recaptchaVerifier
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
  }

  const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string) => {
    await confirmationResult.confirm(code)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        logout,
        registerWithEmail,
        loginWithEmail,
        sendPhoneVerification,
        verifyPhoneCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
