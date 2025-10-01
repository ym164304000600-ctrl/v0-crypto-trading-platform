export const demoPortfolioData = {
  totalValue: 45250.75,
  totalChange: 2.34,
  totalChangeAmount: 1035.5,
  holdings: [
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.75,
      value: 32500.0,
      change: 3.2,
      changeAmount: 1008.5,
      price: 43333.33,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 5.2,
      value: 8750.25,
      change: -1.8,
      changeAmount: -160.25,
      price: 1682.74,
    },
    {
      symbol: "ADA",
      name: "Cardano",
      amount: 12000,
      value: 4000.5,
      change: 5.7,
      changeAmount: 216.25,
      price: 0.333,
    },
  ],
}

export const demoTransactions = [
  {
    id: "1",
    type: "buy" as const,
    symbol: "BTC",
    amount: 0.25,
    price: 43200.0,
    total: 10800.0,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "completed" as const,
  },
  {
    id: "2",
    type: "sell" as const,
    symbol: "ETH",
    amount: 1.5,
    price: 1680.0,
    total: 2520.0,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: "completed" as const,
  },
  {
    id: "3",
    type: "buy" as const,
    symbol: "ADA",
    amount: 5000,
    price: 0.335,
    total: 1675.0,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: "completed" as const,
  },
]

export const demoMarketData = [
  { symbol: "BTC", price: 43333.33, change: 3.2 },
  { symbol: "ETH", price: 1682.74, change: -1.8 },
  { symbol: "ADA", price: 0.333, change: 5.7 },
  { symbol: "DOT", price: 7.25, change: 2.1 },
  { symbol: "LINK", price: 14.85, change: -0.9 },
  { symbol: "SOL", price: 98.5, change: 4.3 },
]

export const demoChartData = [
  { date: "2024-01-01", value: 42000 },
  { date: "2024-01-02", value: 42500 },
  { date: "2024-01-03", value: 41800 },
  { date: "2024-01-04", value: 43200 },
  { date: "2024-01-05", value: 44100 },
  { date: "2024-01-06", value: 43800 },
  { date: "2024-01-07", value: 45250 },
]
