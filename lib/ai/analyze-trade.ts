/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIAnalysis } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeTradeWithGemini(
  imageBase64: string,
  mimeType: string = 'image/png',
  tradeContext?: {
    pair: string
    direction: 'long' | 'short'
    entry_price: number
    exit_price: number
    session: string
    pnl: number
  }
): Promise<AIAnalysis> {

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite', // Free tier model
  })

  const prompt = `You are an expert ICT (Inner Circle Trader) mentor reviewing a student's trade.

Analyze this trade chart screenshot carefully using ICT methodology.

${tradeContext ? `
TRADE DETAILS:
- Pair/Symbol: ${tradeContext.pair}
- Direction: ${tradeContext.direction}
- Entry Price: ${tradeContext.entry_price}
- Exit Price: ${tradeContext.exit_price}
- Session: ${tradeContext.session}
- P&L Result: ${tradeContext.pnl > 0 ? `+$${tradeContext.pnl.toFixed(2)} (WIN)` : `-$${Math.abs(tradeContext.pnl).toFixed(2)} (LOSS)`}
` : ''}

YOUR ANALYSIS TASKS:

1. MARKET STRUCTURE SHIFT (MSS):
   - Look for a Break of Structure (BOS) or Change of Character (CHOCH)
   - Did price break a significant swing high/low before the entry?
   - Was the entry BEFORE the MSS? = "Aggressive" (higher risk, no confirmation)
   - Was the entry AFTER the MSS? = "High Probability" (confirmed direction)
   - Is MSS not clearly visible? = "Poor" timing

2. FAIR VALUE GAP (FVG):
   - Look for a 3-candle imbalance where the wicks don't overlap
   - Is there a clear gap/imbalance in the chart?
   - Did price enter from an FVG?

3. OTHER ICT CONCEPTS - identify any present:
   - Order Block (OB): Last bearish candle before bullish move, or last bullish candle before bearish move
   - Breaker Block: A failed order block that price has broken through
   - Liquidity Sweep: Price grabbing highs/lows before reversing
   - Optimal Trade Entry (OTE): Entry in the 62-79% retracement zone
   - Kill Zone: Is entry during London (3-5am EST), New York (8-11am EST)?
   - Balanced Price Range (BPR): Overlapping FVGs
   - Premium/Discount: Is price in premium (above 50%) or discount (below 50%) of range?

4. TRADE MANAGEMENT:
   - Is the stop loss below/above a significant structure?
   - Does the trade target liquidity pools?
   - Is the risk:reward ratio favorable?

RESPOND WITH ONLY THIS JSON (no markdown, no backticks, just pure JSON):
{
  "entryQuality": "Aggressive" or "High Probability" or "Poor",
  "mssIdentified": true or false,
  "fvgIdentified": true or false,
  "ictConcepts": ["list", "of", "identified", "concepts"],
  "feedback": {
    "whatDidWell": ["specific positive point 1", "specific positive point 2"],
    "whatToImprove": ["specific improvement point 1", "specific improvement point 2"],
    "keySuggestion": "One specific actionable tip for next time"
  },
  "reasoning": "2-3 sentence explanation of why entry is Aggressive/High Probability/Poor based on MSS location"
}`

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
      { text: prompt },
    ])

    const response = result.response
    const text = response.text()

    // Clean response - remove any markdown if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleaned) as AIAnalysis

    // Add timestamp
    parsed.analyzedAt = new Date().toISOString()

    // Validate required fields
    if (!parsed.entryQuality || !parsed.feedback || !parsed.ictConcepts) {
      throw new Error('Invalid AI response structure')
    }

    return parsed
  } catch (error: any) {
    console.error('Gemini analysis error:', error)

    // Return fallback if parsing fails
    if (error.message?.includes('JSON')) {
      throw new Error('AI returned invalid format. Please try again.')
    }

    throw error
  }
}

// Convert image URL to base64 for Gemini
export async function imageUrlToBase64(imageUrl: string): Promise<{
  base64: string
  mimeType: string
}> {
  const response = await fetch(imageUrl)
  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const contentType = response.headers.get('content-type') || 'image/png'

  return { base64, mimeType: contentType }
}