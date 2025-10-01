"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, BarChart3, List, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore"

/**
 * Full single-file Trading page with Firebase integration.
 * - Reads coins from Firestore collection "coins"
 * - Reads/writes wallet from/to "wallets/{uid}"
 * - Writes orders to "orders"
 * - Keeps original design (Tabs: Simple, Pro, Orders)
 * - Adds a compact admin panel (optional) to add/update coins locally
 *
 * Save as: app/trading/page.jsx
 *
 * Requirements:
 * - db exported from "@/lib/firebase"
 * - shadcn/ui primitives (Card, Button, Input, Tabs, Select, Badge)
 * - lucide-react
 * - recharts (for chart)
 *
 * Firestore collections:
 * - coins: documents containing { symbol: "BTC", name: "Bitcoin", price: 60000, change: 1.2, direction: "up" }
 * - wallets: doc per user uid, containing USDT and optionally coin balances
 * - orders: documents created when placing an order
 */

// ---------- Helper small UI parts ----------
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  )
}

function formatNumber(n) {
  if (n === null || n === undefined) return "-"
  const num = Number(n)
  if (isNaN(num)) return "-"
  return num.toLocaleString()
}

// ---------- Main component ----------
export default function TradingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // UI state
  const [activeTab, setActiveTab] = useState("simple")
  const [coins, setCoins] = useState([])
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [amount, setAmount] = useState("")
  const [side, setSide] = useState("buy")
  const [wallet, setWallet] = useState(null)
  const [orders, setOrders] = useState([])

  // Admin (local toggles)
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({ symbol: "", name: "", price: "", change: 0, direction: "up" })
  const [adminError, setAdminError] = useState("")

  // --- Firestore: coins (realtime) ---
  useEffect(() => {
    const q = query(collection(db, "coins"), orderBy("symbol"))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        setCoins(list)
        if (!selectedSymbol && list.length > 0) {
          setSelectedSymbol(list[0].symbol)
        }
      },
      (err) => {
        console.error("coins onSnapshot error:", err)
      }
    )
    return () => unsub()
  }, [selectedSymbol])

  // --- Firestore: wallet (realtime) ---
  useEffect(() => {
    if (!user) return
    const ref = doc(db, "wallets", user.uid)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setWallet(snap.data())
        else setWallet({ USDT: 1000 })
      },
      (err) => {
        console.error("wallet onSnapshot error:", err)
      }
    )
    return () => unsub()
  }, [user])

  // --- Firestore: orders (realtime, filtered by uid client-side) ---
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setOrders(list.filter((o) => o.uid === user.uid))
      },
      (err) => {
        console.error("orders onSnapshot error:", err)
      }
    )
    return () => unsub()
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login")
  }, [loading, user, router])

  if (loading) return <LoadingScreen />
  if (!user) return null

  const selectedCoin = coins.find((c) => c.symbol === selectedSymbol) || null
  const userUSDT = Number(wallet?.USDT ?? 0)
  const userCoinBalance = Number(wallet?.[selectedCoin?.symbol] ?? 0)

  // cost calculation
  const totalCost = (() => {
    const qty = parseFloat(amount || "0")
    const price = Number(selectedCoin?.price ?? 0)
    if (isNaN(qty) || isNaN(price)) return 0
    return +(qty * price)
  })()

  // place order (buy/sell)
  async function placeOrder(orderSide) {
    if (!selectedCoin) {
      alert("Please select a pair first.")
      return
    }
    const qty = parseFloat(amount)
    if (!qty || qty <= 0) {
      alert("Enter a valid amount.")
      return
    }
    const price = Number(selectedCoin.price)
    if (isNaN(price)) {
      alert("Invalid coin price.")
      return
    }

    try {
      // read wallet snapshot
      const walletRef = doc(db, "wallets", user.uid)
      const walletSnap = await getDoc(walletRef)
      let w = walletSnap.exists() ? walletSnap.data() : { USDT: 0 }

      if (orderSide === "buy") {
        const cost = +(qty * price)
        if ((w.USDT || 0) < cost) {
          alert("Insufficient USDT balance.")
          return
        }
        w.USDT = +( (w.USDT || 0) - cost )
        w[selectedCoin.symbol] = +((w[selectedCoin.symbol] || 0) + qty)
      } else {
        if ((w[selectedCoin.symbol] || 0) < qty) {
          alert(`Insufficient ${selectedCoin.symbol} balance.`)
          return
        }
        const proceeds = +(qty * price)
        w[selectedCoin.symbol] = +((w[selectedCoin.symbol] || 0) - qty)
        w.USDT = +((w.USDT || 0) + proceeds)
      }

      // persist wallet (setDoc merge)
      await setDoc(walletRef, w, { merge: true })

      // create order doc
      await addDoc(collection(db, "orders"), {
        uid: user.uid,
        type: orderSide,
        coin: selectedCoin.symbol,
        amount: qty,
        price,
        total: +(qty * price),
        createdAt: serverTimestamp(),
      })

      setAmount("")
      alert(`Order placed: ${orderSide.toUpperCase()} ${qty} ${selectedCoin.symbol}`)
    } catch (err) {
      console.error("placeOrder error:", err)
      alert("Error placing order. Check console.")
    }
  }

  // small balance card component
  function BalanceCard() {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-tr from-primary/80 to-primary/40 p-3 rounded-xl shadow">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">رصيد محفظتك</div>
          <div className="text-2xl font-bold">
            <span className="text-primary">${formatNumber(userUSDT)}</span>
            <Badge className="ml-2 uppercase">USDT</Badge>
          </div>
          <div className="text-sm text-muted-foreground">رصيد {selectedCoin?.symbol ?? "-"}: {formatNumber(userCoinBalance)}</div>
        </div>
      </div>
    )
  }

  // build chart data around current price (small synthetic dataset)
  const chartData = useMemo(() => {
    if (!selectedCoin) return []
    const base = Number(selectedCoin.price)
    if (isNaN(base)) return []
    return Array.from({ length: 30 }).map((_, i) => {
      const variation = (Math.sin(i / 3) + Math.random() * 0.6) * (base * 0.002)
      const value = Number((base + variation).toFixed(2))
      return { t: i, p: value }
    })
  }, [selectedCoin])

  // Admin: add or update coin from adminForm
  async function adminSaveCoin() {
    setAdminError("")
    const s = (adminForm.symbol || "").trim()
    const n = (adminForm.name || "").trim()
    const p = Number(adminForm.price)
    const ch = Number(adminForm.change || 0)
    const dir = adminForm.direction === "down" ? "down" : "up"
    if (!s || !n || isNaN(p)) {
      setAdminError("Symbol, name and numeric price are required.")
      return
    }
    try {
      // set document id = symbol (safe)
      await setDoc(doc(db, "coins", s), {
        symbol: s,
        name: n,
        price: p,
        change: ch,
        direction: dir,
      }, { merge: true })
      setAdminForm({ symbol: "", name: "", price: "", change: 0, direction: "up" })
      alert("Coin saved.")
    } catch (err) {
      console.error("adminSaveCoin error:", err)
      setAdminError("Failed to save coin.")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Trading</h1>
              <p className="text-sm text-muted-foreground">Simple / Pro / Orders — prices come from your Firestore <code>coins</code> collection</p>
            </div>

            <div className="flex items-center gap-6">
              <BalanceCard />
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">connected</Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left column: Markets list & admin */}
            <aside className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Markets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedSymbol ?? ""} onValueChange={(v) => setSelectedSymbol(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {coins.map((c) => (
                        <SelectItem key={c.symbol} value={c.symbol}>
                          {c.symbol}/USDT — ${formatNumber(c.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid gap-2">
                    {coins.slice(0, 10).map((c) => (
                      <button
                        key={c.symbol}
                        onClick={() => setSelectedSymbol(c.symbol)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedSymbol === c.symbol ? "bg-accent/5 ring-1 ring-accent/30" : "hover:bg-accent/3"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{c.symbol}/USDT</div>
                            <div className="text-xs text-muted-foreground">{c.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${formatNumber(c.price)}</div>
                            <div className={`text-sm ${c.direction === "up" ? "text-green-400" : "text-red-400"}`}>
                              {c.direction === "up" ? <ArrowUpRight className="inline-block w-4 h-4" /> : <ArrowDownRight className="inline-block w-4 h-4" />}
                              &nbsp;{c.change ?? 0}%
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Button onClick={() => { setSide("buy"); setActiveTab("simple") }} className="flex-1">Quick Buy</Button>
                    <Button onClick={() => { setSide("sell"); setActiveTab("simple") }} variant="outline" className="flex-1">Quick Sell</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Admin</div>
                    <Button size="sm" variant="ghost" onClick={() => setShowAdmin(!showAdmin)}>{showAdmin ? "Hide" : "Show"}</Button>
                  </div>
                  {showAdmin && (
                    <div className="space-y-2 mt-2">
                      <Input placeholder="Symbol e.g. BTC" value={adminForm.symbol} onChange={(e) => setAdminForm((p) => ({ ...p, symbol: e.target.value }))} />
                      <Input placeholder="Name e.g. Bitcoin" value={adminForm.name} onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))} />
                      <Input placeholder="Price e.g. 67000" value={adminForm.price} onChange={(e) => setAdminForm((p) => ({ ...p, price: e.target.value }))} />
                      <div className="flex gap-2">
                        <Input placeholder="Change %" value={adminForm.change} onChange={(e) => setAdminForm((p) => ({ ...p, change: e.target.value }))} />
                        <select value={adminForm.direction} onChange={(e) => setAdminForm((p) => ({ ...p, direction: e.target.value }))} className="rounded border px-2 py-1 bg-card">
                          <option value="up">up</option>
                          <option value="down">down</option>
                        </select>
                      </div>
                      {adminError && <div className="text-sm text-red-400">{adminError}</div>}
                      <div className="flex gap-2">
                        <Button onClick={adminSaveCoin} className="flex-1">Save Coin</Button>
                        <Button variant="ghost" onClick={() => setShowAdmin(false)}>Close</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>

            {/* Center: Chart & market info */}
            <section className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedCoin ? `${selectedCoin.symbol}/USDT` : "Select a pair"}</CardTitle>
                    <div className="text-sm text-muted-foreground">{selectedCoin?.name ?? ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="text-xl font-bold">${formatNumber(selectedCoin?.price)}</div>
                    <div className={`text-sm ${selectedCoin?.direction === "up" ? "text-green-400" : "text-red-400"}`}>{selectedCoin ? `${selectedCoin.change}%` : ""}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCoin ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <Line type="monotone" dataKey="p" stroke="#06b6d4" strokeWidth={2} dot={false} />
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="t" />
                        <YAxis />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-muted-foreground">Select a pair to view chart</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Depth & Trades (demo)</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Order Book (demo)</div>
                    <div className="grid grid-cols-3 text-xs text-muted-foreground">
                      <div>Price</div>
                      <div>Amount</div>
                      <div>Total</div>
                    </div>
                    {selectedCoin && Array.from({ length: 8 }).map((_, i) => {
                      const price = +(Number(selectedCoin.price) * (1 + (i - 4) * 0.001)).toFixed(2)
                      const amt = ((Math.random() * 2) + 0.05).toFixed(3)
                      return (
                        <div key={i} className="grid grid-cols-3 py-1 border-b text-sm">
                          <div>{price}</div>
                          <div>{amt}</div>
                          <div>{(price * parseFloat(amt)).toFixed(2)}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Recent Trades (demo)</div>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const price = selectedCoin ? +(Number(selectedCoin.price) + (Math.random() - 0.5) * Number(selectedCoin.price) * 0.002).toFixed(2) : 0
                      const amt = (Math.random() * 0.8 + 0.001).toFixed(3)
                      const isBuy = Math.random() > 0.5
                      return (
                        <div key={i} className="flex justify-between py-1 border-b text-sm">
                          <div className={isBuy ? "text-green-400" : "text-red-400"}>{isBuy ? "BUY" : "SELL"}</div>
                          <div>{amt}</div>
                          <div>{price}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Right: Trade box */}
            <aside className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Pair</div>
                    <div className="font-medium">{selectedCoin ? `${selectedCoin.symbol}/USDT` : "-"}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setSide("buy")} variant={side === "buy" ? "default" : "ghost"} className={side === "buy" ? "bg-green-600 hover:bg-green-700" : ""}>Buy</Button>
                    <Button onClick={() => setSide("sell")} variant={side === "sell" ? "default" : "ghost"} className={side === "sell" ? "bg-red-600 hover:bg-red-700" : ""}>Sell</Button>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Amount ({selectedCoin?.symbol ?? "-"})</div>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.000" />
                  </div>

                  <div className="text-sm text-muted-foreground">Price: <span className="font-medium">${formatNumber(selectedCoin?.price)}</span></div>
                  <div className="text-sm">Total: <span className="font-semibold">${(totalCost || 0).toFixed(2)}</span></div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => placeOrder(side === "buy" ? "buy" : "sell")}>{side === "buy" ? "Buy" : "Sell"}</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setAmount("")}>Clear</Button>
                  </div>

                  <div className="text-xs text-muted-foreground">Available: {formatNumber(userCoinBalance)} {selectedCoin?.symbol ?? ""} • ${formatNumber(userUSDT)} USDT</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Presets</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {[0.25, 0.5, 0.75, 1].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        if (!selectedCoin) return
                        if (side === "buy") {
                          const maxQty = userUSDT / Number(selectedCoin.price || 1)
                          setAmount((maxQty * p).toFixed(6))
                        } else {
                          setAmount((userCoinBalance * p).toFixed(6))
                        }
                      }}
                      className="px-3 py-1 bg-muted rounded text-sm"
                    >
                      {Math.round(p * 100)}%
                    </button>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>

          {/* Tabs area preserved (original structure) */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Simple Trading
                </TabsTrigger>
                <TabsTrigger value="pro" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Pro Trading
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <List className="w-4 h-4" /> My Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple">
                <div className="grid md:grid-cols-2 gap-4">
                  {coins.map((c) => (
                    <Card key={c.symbol} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{c.symbol}/USDT</div>
                          <div className="text-xs text-muted-foreground">{c.name || ""}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${formatNumber(c.price)}</div>
                          <div className={`text-sm ${c.direction === "up" ? "text-green-400" : "text-red-400"}`}>{c.change}%</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => { setSelectedSymbol(c.symbol); setSide("buy"); setActiveTab("simple") }} className="flex-1">Buy</Button>
                        <Button onClick={() => { setSelectedSymbol(c.symbol); setSide("sell"); setActiveTab("simple") }} variant="outline" className="flex-1">Sell</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pro">
                <div className="p-4 bg-card rounded-lg">
                  <div className="text-muted-foreground">Pro trading panel — advanced options can be implemented here (order types, depth chart, indicators).</div>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <div className="space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {orders.length === 0 ? (
                        <div className="text-muted-foreground">No orders yet.</div>
                      ) : (
                        <div className="space-y-2">
                          {orders.map((o) => (
                            <div key={o.id} className="flex justify-between items-center border-b py-2">
                              <div>
                                <div className="font-semibold">{o.coin}</div>
                                <div className="text-xs text-muted-foreground">{o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString() : ""}</div>
                              </div>
                              <div className="text-right">
                                <div className={o.type === "buy" ? "text-green-400" : "text-red-400"}>{o.type.toUpperCase()}</div>
                                <div className="font-semibold">{o.amount} @ ${formatNumber(o.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

/* End of file */
