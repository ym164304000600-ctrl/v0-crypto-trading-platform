export interface PaymentMethod {
  id: string
  name: string
  type: "mobile_wallet" | "bank_transfer" | "card" | "fawry" | "instapay"
  minAmount: number
  maxAmount: number
  fee: number
  feeType: "fixed" | "percentage"
  settlementTime: string
  instructions: string
  isActive: boolean
  icon: string
  fields: PaymentField[]
}

export interface PaymentField {
  name: string
  label: string
  type: "text" | "number" | "select"
  required: boolean
  placeholder?: string
  options?: string[]
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "vodafone_cash",
    name: "Vodafone Cash",
    type: "mobile_wallet",
    minAmount: 50,
    maxAmount: 50000,
    fee: 5,
    feeType: "fixed",
    settlementTime: "5-15 minutes",
    instructions: "Send money to our Vodafone Cash number and upload the receipt",
    isActive: true,
    icon: "📱",
    fields: [
      { name: "phone", label: "Your Vodafone Number", type: "text", required: true, placeholder: "01012345678" },
    ],
  },
  {
    id: "orange_cash",
    name: "Orange Cash",
    type: "mobile_wallet",
    minAmount: 50,
    maxAmount: 30000,
    fee: 5,
    feeType: "fixed",
    settlementTime: "5-15 minutes",
    instructions: "Send money to our Orange Cash number and upload the receipt",
    isActive: true,
    icon: "🟠",
    fields: [{ name: "phone", label: "Your Orange Number", type: "text", required: true, placeholder: "01112345678" }],
  },
  {
    id: "etisalat_cash",
    name: "Etisalat Cash",
    type: "mobile_wallet",
    minAmount: 50,
    maxAmount: 25000,
    fee: 5,
    feeType: "fixed",
    settlementTime: "5-15 minutes",
    instructions: "Send money to our Etisalat Cash number and upload the receipt",
    isActive: true,
    icon: "🟢",
    fields: [
      { name: "phone", label: "Your Etisalat Number", type: "text", required: true, placeholder: "01512345678" },
    ],
  },
  {
    id: "instapay",
    name: "InstaPay",
    type: "instapay",
    minAmount: 100,
    maxAmount: 100000,
    fee: 0,
    feeType: "fixed",
    settlementTime: "Instant",
    instructions: "Transfer using InstaPay to our account and upload the receipt",
    isActive: true,
    icon: "⚡",
    fields: [
      { name: "phone", label: "Your Phone Number", type: "text", required: true, placeholder: "01012345678" },
      {
        name: "bank",
        label: "Your Bank",
        type: "select",
        required: true,
        options: ["CIB", "NBE", "Banque Misr", "ADCB", "QNB", "Other"],
      },
    ],
  },
  {
    id: "fawry",
    name: "Fawry",
    type: "fawry",
    minAmount: 20,
    maxAmount: 10000,
    fee: 3,
    feeType: "fixed",
    settlementTime: "10-30 minutes",
    instructions: "Pay at any Fawry location using our payment code",
    isActive: true,
    icon: "🏪",
    fields: [{ name: "phone", label: "Your Phone Number", type: "text", required: true, placeholder: "01012345678" }],
  },
  {
    id: "cib_bank",
    name: "CIB Bank Transfer",
    type: "bank_transfer",
    minAmount: 500,
    maxAmount: 500000,
    fee: 0,
    feeType: "fixed",
    settlementTime: "1-3 hours",
    instructions: "Transfer to our CIB account and upload the receipt",
    isActive: true,
    icon: "🏦",
    fields: [
      { name: "account_holder", label: "Account Holder Name", type: "text", required: true },
      { name: "account_number", label: "Your Account Number", type: "text", required: true },
    ],
  },
  {
    id: "nbe_bank",
    name: "NBE Bank Transfer",
    type: "bank_transfer",
    minAmount: 500,
    maxAmount: 500000,
    fee: 0,
    feeType: "fixed",
    settlementTime: "1-3 hours",
    instructions: "Transfer to our NBE account and upload the receipt",
    isActive: true,
    icon: "🏦",
    fields: [
      { name: "account_holder", label: "Account Holder Name", type: "text", required: true },
      { name: "account_number", label: "Your Account Number", type: "text", required: true },
    ],
  },
  {
    id: "banque_misr",
    name: "Banque Misr Transfer",
    type: "bank_transfer",
    minAmount: 500,
    maxAmount: 500000,
    fee: 0,
    feeType: "fixed",
    settlementTime: "1-3 hours",
    instructions: "Transfer to our Banque Misr account and upload the receipt",
    isActive: true,
    icon: "🏦",
    fields: [
      { name: "account_holder", label: "Account Holder Name", type: "text", required: true },
      { name: "account_number", label: "Your Account Number", type: "text", required: true },
    ],
  },
  {
    id: "credit_card",
    name: "Credit/Debit Card",
    type: "card",
    minAmount: 100,
    maxAmount: 50000,
    fee: 2.9,
    feeType: "percentage",
    settlementTime: "Instant",
    instructions: "Pay securely with your credit or debit card",
    isActive: true,
    icon: "💳",
    fields: [
      { name: "card_holder", label: "Cardholder Name", type: "text", required: true },
      { name: "card_number", label: "Card Number", type: "text", required: true, placeholder: "1234 5678 9012 3456" },
      { name: "expiry", label: "Expiry Date", type: "text", required: true, placeholder: "MM/YY" },
      { name: "cvv", label: "CVV", type: "text", required: true, placeholder: "123" },
    ],
  },
]

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((method) => method.id === id)
}

export function calculateFee(amount: number, method: PaymentMethod): number {
  if (method.feeType === "fixed") {
    return method.fee
  } else {
    return (amount * method.fee) / 100
  }
}
