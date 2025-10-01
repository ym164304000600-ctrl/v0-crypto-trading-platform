"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { toast } from "sonner"

import { Navigation } from "@/components/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function safeNum(v: any, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
function formatNum(n: any) {
  const num = safeNum(n, NaN)
  if (Number.isNaN(num)) return "-"
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const EGP_RATE = 50

export default function TradingPage() {
  const { user, loading } = useAuth()
  const [coins, setCoins] = useState<any[]>([])
  const [wallet, setWallet] = useState<any>({})
  const [orders, setOrders] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [modalTrade, setModalTrade] = useState(false)

  // العملات من Firestore
  useEffect(() => {
    const q = query(collection(db, "coins"), orderBy("symbol"))
    const unsub = onSnapshot(q, (snap) => {
      setCoins(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // المحفظة
  useEffect(() => {
    if (!user) return
    const wref = doc(db, "wallets", user.uid)
    const unsub = onSnapshot(wref, (snap) => {
      if (snap.exists()) setWallet(snap.data())
      else setWallet({ USDT: 0 })
    })
    return () => unsub()
  }, [user])

  // سجل المعاملات
  useEffect(() => {
    if (!user) return
    const oq = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(oq, (snap) => {
      const allOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setOrders(allOrders.filter((o) => o.uid === user.uid))
    })
    return () => unsub()
  }, [user])

  if (loading) return <div className="flex items-center justify-center h-screen">تحميل...</div>
  if (!user) return null

  const qty = safeNum(amount, 0)
  const price = safeNum(selected?.price, 0)
  const total = qty * price

  const userUSDT = safeNum(wallet?.USDT, 0)
  const userCoin = safeNum(wallet?.[selected?.symbol], 0)

  // تنفيذ أوامر
  async function placeOrder(type: "buy" | "sell") {
    if (!selected) return toast.error("اختر عملة أولاً")
    if (qty <= 0) return toast.error("ادخل كمية صحيحة")

    const wref = doc(db, "wallets", user.uid)
    const wSnap = await getDoc(wref)
    let wdata = wSnap.exists() ? wSnap.data() : { USDT: 0 }

    if (type === "buy") {
      const cost = qty * price
      if (wdata.USDT < cost) return toast.error("رصيد USDT غير كافي ❌")
      wdata.USDT -= cost
      wdata[selected.symbol] = (wdata[selected.symbol] || 0) + qty
    } else {
      if ((wdata[selected.symbol] || 0) < qty) return toast.error("رصيد غير كافي ❌")
      const gain = qty * price
      wdata[selected.symbol] -= qty
      wdata.USDT += gain
    }

    await setDoc(wref, wdata, { merge: true })
    await addDoc(collection(db, "orders"), {
      uid: user.uid,
      coin: selected.symbol,
      type,
      amount: qty,
      price,
      total: qty * price,
      createdAt: serverTimestamp(),
    })

    toast.success(type === "buy" ? "تم تنفيذ عملية الشراء ✅" : "تم تنفيذ عملية البيع ✅")
    setAmount("")
    setModalTrade(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* القائمة العلوية */}
      <Navigation />

      <div className="md:ml-64 p-6 space-y-6">
        <h1 className="text-2xl font-bold">منصة التداول</h1>

        {/* ✅ كارت الرصيد */}
        <div className="max-w-sm">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="text-sm">رصيد الحساب</div>
            <div className="text-2xl font-bold mt-2">${formatNum(userUSDT)}</div>
            <div className="text-md mt-1">EGP {formatNum(userUSDT * EGP_RATE)}</div>
            <div className="absolute bottom-2 right-4 text-xs opacity-70">Virtual Bank Card</div>
          </div>
        </div>

        {/* ✅ شريط العملات المتحرك */}
        <div className="w-full bg-muted py-2 overflow-hidden whitespace-nowrap border rounded-lg shadow-md">
          <div className="animate-marquee flex gap-8 text-sm font-medium px-4">
            {coins.map((c) => (
              <span key={c.id} className="flex gap-1 items-center">
                {c.symbol}: <span className="text-green-600">${formatNum(c.price)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ✅ العملات + سجل المعاملات */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* العملات */}
          <div className="lg:col-span-2 grid gap-4">
            {coins.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer hover:scale-[1.02] transition"
                onClick={() => {
                  setSelected(c)
                  setModalTrade(true)
                }}
              >
                <CardContent className="flex justify-between items-center py-4">
                  <div>
                    <h3 className="font-bold">{c.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{c.name || "Crypto"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${formatNum(c.price)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* سجل المعاملات */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>📑 آخر المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">النوع</th>
                    <th className="text-left">العملة</th>
                    <th className="text-left">الكمية</th>
                    <th className="text-left">السعر</th>
                    <th className="text-left">الإجمالي</th>
                    <th className="text-left">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30">
                      <td className={t.type === "buy" ? "text-green-600" : "text-red-600"}>
                        {t.type.toUpperCase()}
                      </td>
                      <td>{t.coin}</td>
                      <td>{t.amount}</td>
                      <td>${formatNum(t.price)}</td>
                      <td>${formatNum(t.total)}</td>
                      <td>{t.createdAt?.toDate?.().toLocaleString?.() || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* نافذة البيع والشراء */}
      <Dialog open={modalTrade} onOpenChange={setModalTrade}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تداول {selected?.symbol}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="buy">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="buy" className="w-1/2">شراء</TabsTrigger>
              <TabsTrigger value="sell" className="w-1/2">بيع</TabsTrigger>
            </TabsList>

            {/* شراء */}
            <TabsContent value="buy">
              <div className="space-y-3">
                <Input type="number" placeholder="الكمية" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <p className="text-sm">الإجمالي: <span className="font-bold">${formatNum(total)}</span></p>
                <Button
                  disabled={total > userUSDT}
                  className="mt-3 bg-green-600 text-white w-full hover:bg-green-700"
                  onClick={() => placeOrder("buy")}
                >
                  {total > userUSDT ? "رصيد غير كافي" : "تنفيذ شراء"}
                </Button>
              </div>
            </TabsContent>

            {/* بيع */}
            <TabsContent value="sell">
              <div className="space-y-3">
                <Input type="number" placeholder="الكمية" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <p className="text-sm">الإجمالي: <span className="font-bold">${formatNum(total)}</span></p>
                <Button
                  disabled={qty > userCoin}
                  className="mt-3 bg-red-600 text-white w-full hover:bg-red-700"
                  onClick={() => placeOrder("sell")}
                >
                  {qty > userCoin ? "رصيد غير كافي" : "تنفيذ بيع"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
