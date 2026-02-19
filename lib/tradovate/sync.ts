/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'
import { TradovateClient } from './client'

interface SyncResult {
  success: boolean
  newTrades: number
  updatedTrades: number
  errors: string[]
}

export async function syncTradovateAccount(
  userId: string,
  connectionId: string
): Promise<SyncResult> {
  const supabase = await createClient()
  const result: SyncResult = {
    success: false,
    newTrades: 0,
    updatedTrades: 0,
    errors: [],
  }

  try {
    // Get connection
    const { data: connection, error: connError } = await supabase
      .from('tradovate_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', userId)
      .single()

    if (connError || !connection) {
      result.errors.push('Connection not found')
      return result
    }

    // Decrypt password
    const password = decrypt(connection.encrypted_password)

    // Authenticate with Tradovate
    const client = new TradovateClient(connection.is_demo)
    await client.authenticate(connection.username, password)

    // Get fills from last 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const fills = await client.getFills(
      connection.account_id,
      startDate.toISOString()
    )

    // Group fills by order ID to create complete trades
    const orderMap = new Map<number, typeof fills>()
    fills.forEach((fill) => {
      if (!orderMap.has(fill.orderId)) {
        orderMap.set(fill.orderId, [])
      }
      orderMap.get(fill.orderId)!.push(fill)
    })

    // Process each order as a trade
    for (const [orderId, orderFills] of orderMap.entries()) {
      try {
        // Sort by timestamp
        orderFills.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        const entry = orderFills[0]
        const exit = orderFills[orderFills.length - 1]

        // Skip if same fill (not a complete trade)
        if (entry.id === exit.id) continue

        // Get contract details
        const contract = await client.getContract(entry.contractId)
        const pair = contract.name

        // Determine direction
        const direction = entry.action === 'Buy' ? 'long' : 'short'

        // Calculate P&L
        const entryPrice = entry.price
        const exitPrice = exit.price
        const lotSize = entry.qty
        const pnl = direction === 'long'
          ? (exitPrice - entryPrice) * lotSize
          : (entryPrice - exitPrice) * lotSize

        // Check if trade already exists
        const { data: existingTrade } = await supabase
          .from('trades')
          .select('id')
          .eq('user_id', userId)
          .eq('tradovate_order_id', orderId)
          .single()

        const tradeData = {
          user_id: userId,
          trade_date: new Date(entry.tradeDate).toISOString(),
          pair,
          direction,
          entry_price: entryPrice,
          exit_price: exitPrice,
          lot_size: lotSize,
          pnl,
          session: 'other', // Can be improved based on timestamp
          tradovate_order_id: orderId,
          prop_firm_id: connection.prop_firm_id,
        }

        if (existingTrade) {
          // Update existing
          const { error } = await supabase
            .from('trades')
            .update(tradeData)
            .eq('id', existingTrade.id)

          if (!error) result.updatedTrades++
          else result.errors.push(`Failed to update trade ${orderId}: ${error.message}`)
        } else {
          // Create new
          const { error } = await supabase
            .from('trades')
            .insert([tradeData])

          if (!error) result.newTrades++
          else result.errors.push(`Failed to create trade ${orderId}: ${error.message}`)
        }
      } catch (error: any) {
        result.errors.push(`Error processing order ${orderId}: ${error.message}`)
      }
    }

    // Update last sync time
    await supabase
      .from('tradovate_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connectionId)

    result.success = result.errors.length === 0
    return result
  } catch (error: any) {
    result.errors.push(error.message)
    return result
  }
}