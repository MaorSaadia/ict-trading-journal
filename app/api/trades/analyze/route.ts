/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { analyzeTradeWithGemini, imageUrlToBase64 } from '@/lib/ai/analyze-trade'
import { checkSubscriptionLimit } from '@/lib/subscription'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Check subscription limit
    const limitCheck = await checkSubscriptionLimit(user.id, 'analyses')

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Free tier limit: ${limitCheck.limit} AI analyses per month. You've used ${limitCheck.current}. Upgrade to Pro for unlimited analyses.`,
          limitReached: true,
        },
        { status: 403 }
      )
    }

    const { tradeId } = await req.json()

    if (!tradeId) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 })
    }

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()

    if (tradeError || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (!trade.image_url) {
      return NextResponse.json(
        { error: 'Trade has no screenshot. Please upload a chart image first.' },
        { status: 400 }
      )
    }

    const { base64, mimeType } = await imageUrlToBase64(trade.image_url)

    const analysis = await analyzeTradeWithGemini(
      base64,
      mimeType,
      {
        pair: trade.pair,
        direction: trade.direction,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        session: trade.session,
        pnl: trade.pnl,
      }
    )

    const { error: updateError } = await supabase
      .from('trades')
      .update({
        ai_analysis: analysis,
        entry_quality: analysis.entryQuality,
        ict_concepts: analysis.ictConcepts,
        mss_identified: analysis.mssIdentified,
        fvg_identified: analysis.fvgIdentified,
      })
      .eq('id', tradeId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error: any) {
    console.error('Analysis route error:', error)
    return NextResponse.json(
      { error: error.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}