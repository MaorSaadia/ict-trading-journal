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
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.2, // Low = more consistent, less creative
      topP: 0.8,
      maxOutputTokens: 800,
    }
  })

  const isWin = tradeContext ? tradeContext.pnl > 0 : null
  const prompt = `You are a strict ICT (Inner Circle Trader) trading mentor with 10+ years experience. Your job is to review a student's trade chart screenshot and provide honest, specific feedback using pure ICT methodology.

${tradeContext ? `
TRADE CONTEXT:
- Symbol: ${tradeContext.pair}
- Direction: ${tradeContext.direction.toUpperCase()}
- Entry: ${tradeContext.entry_price}
- Exit: ${tradeContext.exit_price}
- Session: ${tradeContext.session}
- Result: ${isWin ? `WIN (+$${tradeContext.pnl.toFixed(2)})` : `LOSS (-$${Math.abs(tradeContext.pnl).toFixed(2)})`}
` : ''}

STEP 1 - IDENTIFY MARKET STRUCTURE:
Look carefully at the chart for swing highs and swing lows.
- Is price making Higher Highs and Higher Lows? → Bullish structure
- Is price making Lower Highs and Lower Lows? → Bearish structure
- Was there a BREAK of a significant swing point? → That is the MSS/CHOCH

STEP 2 - CLASSIFY THE MSS:
A Market Structure Shift (MSS) or Change of Character (CHOCH) is when price BREAKS a previous swing high (bullish MSS) or swing low (bearish MSS).
- AFTER MSS = entry taken after the structural break with confirmation → "High Probability"
- BEFORE MSS = entry taken before the structural break, anticipating it → "Aggressive"  
- NO clear MSS visible or entry unrelated to structure → "Poor"

STEP 3 - IDENTIFY FAIR VALUE GAP (FVG):
Look for a 3-candle pattern where:
- Candle 1's wick and Candle 3's wick do NOT overlap
- This leaves an open gap/imbalance in price
- Did the entry come FROM an FVG fill?

STEP 4 - CHECK OTHER ICT CONCEPTS:
Only mark as present if CLEARLY visible:
- "Order Block": Last bearish candle before bullish impulse (or vice versa)
- "Breaker Block": An order block that was violated and retested
- "Liquidity Sweep": Price spikes beyond a swing high/low then reverses (stop hunt)
- "Kill Zone": Entry during 2-5am EST (London) or 7-10am EST (New York open)
- "OTE": Entry in the 62%-79% retracement of a swing
- "Premium/Discount": Entry below 50% of a range (discount for buys) or above (premium for sells)
- "Balanced Price Range": Two overlapping FVGs
- "Power of 3": Accumulation → Manipulation → Distribution pattern visible

STEP 5 - EVALUATE TRADE MANAGEMENT:
- Is stop loss BELOW the order block / swing low (for longs)?
- Is stop loss ABOVE the order block / swing high (for shorts)?
- Does the take profit target an old high/low (liquidity)?
- Is the risk:reward at least 1:2?

STEP 6 - GIVE HONEST FEEDBACK:
- Be SPECIFIC, not generic. Reference what you actually see.
- If the trade was a ${isWin ? 'WIN' : 'LOSS'}, explain whether it was due to good/bad execution or just luck/bad luck
- Point out the SINGLE most important thing to improve
- Keep each point to 1 sentence max

RESPOND WITH ONLY VALID JSON - NO MARKDOWN, NO BACKTICKS, NO EXTRA TEXT:
{
  "entryQuality": "High Probability" or "Aggressive" or "Poor",
  "mssIdentified": true or false,
  "fvgIdentified": true or false,
  "ictConcepts": ["only concepts clearly visible"],
  "feedback": {
    "whatDidWell": ["specific observation 1", "specific observation 2"],
    "whatToImprove": ["specific improvement 1", "specific improvement 2"],
    "keySuggestion": "The single most important actionable tip for this specific trade"
  },
  "reasoning": "2-3 sentences explaining exactly WHY this entry is High Probability/Aggressive/Poor based on where the MSS occurred relative to the entry"
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

    // Aggressive JSON extraction
    let jsonStr = text.trim()

    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()

    // Find the JSON object
    const firstBrace = jsonStr.indexOf('{')
    const lastBrace = jsonStr.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON found in AI response')
    }

    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)

    const parsed = JSON.parse(jsonStr) as AIAnalysis

    // Validate required fields
    if (!['High Probability', 'Aggressive', 'Poor'].includes(parsed.entryQuality)) {
      parsed.entryQuality = 'Poor'
    }

    if (!Array.isArray(parsed.ictConcepts)) {
      parsed.ictConcepts = []
    }

    if (!parsed.feedback?.whatDidWell) {
      parsed.feedback = {
        whatDidWell: ['Trade was executed'],
        whatToImprove: ['Review ICT concepts before trading'],
        keySuggestion: 'Study market structure before entering trades'
      }
    }

    // Add timestamp
    parsed.analyzedAt = new Date().toISOString()

    return parsed
  } catch (error: any) {
    console.error('Gemini analysis error:', error)

    if (error.message?.includes('JSON')) {
      throw new Error('AI returned invalid format. Please try again.')
    }

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('AI rate limit reached. Please wait a moment and try again.')
    }

    throw error
  }
}

export async function imageUrlToBase64(imageUrl: string): Promise<{
  base64: string
  mimeType: string
}> {
  const response = await fetch(imageUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const contentType = response.headers.get('content-type') || 'image/png'

  return { base64, mimeType: contentType }
}