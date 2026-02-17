export interface Trade {
  id: string
  user_id: string
  image_url: string | null
  trade_date: string
  pair: string
  direction: 'long' | 'short'
  entry_price: number | null
  exit_price: number | null
  lot_size: number | null
  pnl: number | null
  session: 'london' | 'newyork' | 'asia' | 'other' | null
  ai_analysis: AIAnalysis | null
  entry_quality: 'Aggressive' | 'High Probability' | 'Poor' | null
  ict_concepts: string[] | null
  mss_identified: boolean | null
  fvg_identified: boolean | null
  user_notes: string | null
  prop_firm_id: string | null
  tradovate_order_id: number | null
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  entryQuality: 'Aggressive' | 'High Probability' | 'Poor'
  mssIdentified: boolean
  fvgIdentified: boolean
  ictConcepts: string[]
  feedback: {
    whatDidWell: string[]
    whatToImprove: string[]
    keySuggestion: string
  }
  reasoning: string
  analyzedAt: string
}

export interface TradeFormData {
  trade_date: string
  pair: string
  direction: 'long' | 'short'
  entry_price: string
  exit_price: string
  lot_size: string
  session: 'london' | 'newyork' | 'asia' | 'other'
  user_notes: string
}