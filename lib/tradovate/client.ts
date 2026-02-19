/* eslint-disable @typescript-eslint/no-explicit-any */


interface TradovateAuth {
  accessToken: string
  expirationTime: string
  userId: number
  userStatus: string
}

interface TradovateFill {
  id: number
  orderId: number
  contractId: number
  timestamp: string
  tradeDate: string
  action: 'Buy' | 'Sell'
  qty: number
  price: number
  active: boolean
}

interface TradovateContract {
  id: number
  name: string
  contractMaturityId: number
  status: string
}

export class TradovateClient {
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(demo: boolean = true) {
    this.baseUrl = demo
      ? 'https://demo.tradovateapi.com/v1'
      : 'https://live.tradovateapi.com/v1'
  }

  async authenticate(username: string, password: string): Promise<TradovateAuth> {
    const response = await fetch(`${this.baseUrl}/auth/accesstokenrequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        password: password,
        appId: 'ICT-Trading-Journal',
        appVersion: '1.0',
        deviceId: 'web-app',
        cid: 0,
        sec: '',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Tradovate auth failed: ${error}`)
    }

    const auth: TradovateAuth = await response.json()
    this.accessToken = auth.accessToken
    this.tokenExpiry = new Date(auth.expirationTime)

    return auth
  }

  async renewToken(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('No token to renew')
    }

    const response = await fetch(`${this.baseUrl}/auth/renewaccesstoken`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Token renewal failed')
    }

    const auth: TradovateAuth = await response.json()
    this.accessToken = auth.accessToken
    this.tokenExpiry = new Date(auth.expirationTime)
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry) {
      throw new Error('Not authenticated')
    }

    // Renew if expires in < 5 minutes
    if (this.tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000) {
      await this.renewToken()
    }
  }

  async getAccounts(): Promise<any[]> {
    await this.ensureAuthenticated()

    const response = await fetch(`${this.baseUrl}/account/list`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch accounts')
    }

    return response.json()
  }

  async getFills(accountId: number, startDate: string): Promise<TradovateFill[]> {
    await this.ensureAuthenticated()

    const response = await fetch(
      `${this.baseUrl}/fill/list?accountId=${accountId}&startTimestamp=${startDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch fills')
    }

    return response.json()
  }

  async getContract(contractId: number): Promise<TradovateContract> {
    await this.ensureAuthenticated()

    const response = await fetch(`${this.baseUrl}/contract/item?id=${contractId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch contract')
    }

    return response.json()
  }

  setToken(token: string, expiry: string): void {
    this.accessToken = token
    this.tokenExpiry = new Date(expiry)
  }
}

export async function testTradovateConnection(
  username: string,
  password: string,
  demo: boolean = true
): Promise<{ success: boolean; accounts?: any[]; error?: string }> {
  try {
    const client = new TradovateClient(demo)
    await client.authenticate(username, password)
    const accounts = await client.getAccounts()

    return {
      success: true,
      accounts,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}