import { CreditCard, Smartphone, Landmark, Banknote, Wallet } from "lucide-react"

export type PaymentMethod = {
  id: string
  name: string
  icon: JSX.Element
  minAmount: number
  maxAmount: number
  feeType: "fixed" | "percentage"
  fee: number
  type: "wallet" | "bank" | "instapay" | "card"
  settlementTime: string
  instructions: string
  isActive: boolean
  fields: {
    name: string
    label: string
    type: string
    placeholder?: string
    required?: boolean
    options?: string[]
  }[]
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "vodafone_cash",
    name: "Vodafone Cash",
    icon: <Smartphone className="w-5 h-5 text-red-500" />,
    minAmount: 50,
    maxAmount: 20000,
    feeType: "fixed",
    fee: 5,
    type: "wallet",
    settlementTime: "Instant",
    instructions: "Send the money to Vodafone Cash number: 01000000000",
    isActive: true,
    fields: [
      {
        name: "wallet_number",
        label: "Your Vodafone Cash Number",
        type: "text",
        placeholder: "010xxxxxxxx",
        required: true,
      },
    ],
  },
  {
    id: "etisalat_cash",
    name: "Etisalat Cash",
    icon: <Smartphone className="w-5 h-5 text-green-600" />,
    minAmount: 50,
    maxAmount: 20000,
    feeType: "fixed",
    fee: 5,
    type: "wallet",
    settlementTime: "Instant",
    instructions: "Send the money to Etisalat Cash number: 01100000000",
    isActive: true,
    fields: [
      {
        name: "wallet_number",
        label: "Your Etisalat Cash Number",
        type: "text",
        placeholder: "011xxxxxxxx",
        required: true,
      },
    ],
  },
  {
    id: "instapay",
    name: "InstaPay",
    icon: <Landmark className="w-5 h-5 text-blue-500" />,
    minAmount: 100,
    maxAmount: 50000,
    feeType: "percentage",
    fee: 1.5,
    type: "instapay",
    settlementTime: "Instant",
    instructions: "Transfer to our InstaPay ID: mycompany@instapay",
    isActive: true,
    fields: [
      {
        name: "instapay_id",
        label: "Your InstaPay ID",
        type: "text",
        placeholder: "example@instapay",
        required: true,
      },
    ],
  },
  {
    id: "fawry",
    name: "Fawry",
    icon: <Wallet className="w-5 h-5 text-yellow-500" />,
    minAmount: 50,
    maxAmount: 10000,
    feeType: "fixed",
    fee: 10,
    type: "wallet",
    settlementTime: "Within 1 hour",
    instructions: "Go to nearest Fawry outlet and pay to Merchant Code: 123456",
    isActive: true,
    fields: [
      {
        name: "reference_number",
        label: "Fawry Reference Number",
        type: "text",
        placeholder: "Enter your Fawry code",
        required: true,
      },
    ],
  },
  {
    id: "visa",
    name: "Visa / MasterCard",
    icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
    minAmount: 100,
    maxAmount: 100000,
    feeType: "percentage",
    fee: 2.5,
    type: "card",
    settlementTime: "Instant",
    instructions: "Enter your card details to proceed.",
    isActive: true,
    fields: [
      { name: "card_number", label: "Card Number", type: "text", placeholder: "xxxx-xxxx-xxxx-xxxx", required: true },
      { name: "expiry_date", label: "Expiry Date", type: "text", placeholder: "MM/YY", required: true },
      { name: "cvv", label: "CVV", type: "password", placeholder: "***", required: true },
    ],
  },
]

export function calculateFee(amount: number, method: PaymentMethod): number {
  if (method.feeType === "fixed") {
    return method.fee
  }
  return (amount * method.fee) / 100
}
