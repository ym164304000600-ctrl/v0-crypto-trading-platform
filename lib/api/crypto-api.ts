// Real cryptocurrency API service using CoinGecko API
export interface CryptoPriceData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  last_updated: string
}

export interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  updatedAt: Date
}

class CryptoAPI {
  private baseUrl = "https://api.coingecko.com/api/v3"

  async getCurrentPrices(symbols: string[] = ["bitcoin", "ethereum", "tether"]): Promise<Record<string, CryptoPrice>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${symbols.join(",")}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch crypto prices")
      }

      const data = await response.json()

      // Convert to EGP (approximate rate: 1 USD = 49.5 EGP)
      const usdToEgp = 49.5

      const prices: Record<string, CryptoPrice> = {}

      if (data.bitcoin) {
        prices.BTC = {
          symbol: "BTC",
          price: data.bitcoin.usd * usdToEgp,
          change24h: data.bitcoin.usd_24h_change || 0,
          volume24h: (data.bitcoin.usd_24h_vol || 0) * usdToEgp,
          updatedAt: new Date(),
        }
      }

      if (data.ethereum) {
        prices.ETH = {
          symbol: "ETH",
          price: data.ethereum.usd * usdToEgp,
          change24h: data.ethereum.usd_24h_change || 0,
          volume24h: (data.ethereum.usd_24h_vol || 0) * usdToEgp,
          updatedAt: new Date(),
        }
      }

      if (data.tether) {
        prices.USDT = {
          symbol: "USDT",
          price: data.tether.usd * usdToEgp,
          change24h: data.tether.usd_24h_change || 0,
          volume24h: (data.tether.usd_24h_vol || 0) * usdToEgp,
          updatedAt: new Date(),
        }
      }

      return prices
    } catch (error) {
      console.error("Error fetching crypto prices:", error)
      // Fallback to mock data if API fails
      return {
        BTC: { symbol: "BTC", price: 2150000, change24h: 2.5, volume24h: 1500000000, updatedAt: new Date() },
        ETH: { symbol: "ETH", price: 83250, change24h: -1.2, volume24h: 800000000, updatedAt: new Date() },
        USDT: { symbol: "USDT", price: 49.5, change24h: 0.1, volume24h: 2000000000, updatedAt: new Date() },
      }
    }
  }

  async getMarketData(limit = 10): Promise<CryptoPriceData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch market data")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching market data:", error)
      return []
    }
  }

  async getCoinHistory(coinId: string, days = 7): Promise<number[][]> {
    try {
      const response = await fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`)

      if (!response.ok) {
        throw new Error("Failed to fetch coin history")
      }

      const data = await response.json()
      return data.prices || []
    } catch (error) {
      console.error("Error fetching coin history:", error)
      return []
    }
  }
}

export const cryptoAPI = new CryptoAPI()
