/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { TradovateClient } from '@/lib/tradovate/client'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, password, accountId, isDemo, propFirmId } = await req.json()

    if (!username || !password || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Test connection first
    const client = new TradovateClient(isDemo)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const auth = await client.authenticate(username, password)

    // Encrypt password before storing
    const encryptedPassword = encrypt(password)

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('tradovate_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('prop_firm_id', propFirmId || null)
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('tradovate_connections')
        .update({
          username,
          encrypted_password: encryptedPassword,
          account_id: accountId,
          is_demo: isDemo,
          is_active: true,
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Create new
      const { error } = await supabase
        .from('tradovate_connections')
        .insert({
          user_id: user.id,
          username,
          encrypted_password: encryptedPassword,
          account_id: accountId,
          is_demo: isDemo,
          prop_firm_id: propFirmId || null,
          is_active: true,
        })

      if (error) throw error
    }

    // Update prop firm if linked
    if (propFirmId) {
      await supabase
        .from('prop_firm_challenges')
        .update({
          tradovate_account_id: accountId,
          auto_sync_enabled: true,
        })
        .eq('id', propFirmId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Connect error:', error)
    return NextResponse.json(
      { error: error.message || 'Connection failed' },
      { status: 500 }
    )
  }
}