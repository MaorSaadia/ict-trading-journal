import type { Trade } from '@/lib/types'

export interface AnalyticsData {
  // Overview stats
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  avgRR: number
  bestTrade: number
  worstTrade: number

  // Chart data
  pnlOverTime: PnLDataPoint[]
  sessionStats: SessionStat[]
  conceptStats: ConceptStat[]
  entryQualityStats: EntryQualityStat[]
  dailyStats: DailyStat[]
  pairStats: PairStat[]
}

export interface PnLDataPoint {
  date: string
  pnl: number
  cumulative: number
}

export interface SessionStat {
  session: string
  trades: number
  wins: number
  winRate: number
  pnl: number
}

export interface ConceptStat {
  concept: string
  trades: number
  wins: number
  winRate: number
  pnl: number
}

export interface EntryQualityStat {
  quality: string
  trades: number
  wins: number
  winRate: number
  pnl: number
}

export interface DailyStat {
  day: string
  trades: number
  wins: number
  winRate: number
  pnl: number
}

export interface PairStat {
  pair: string
  trades: number
  wins: number
  winRate: number
  pnl: number
}

export function calculateAnalytics(trades: Trade[]): AnalyticsData {
  if (trades.length === 0) {
    return getEmptyAnalytics()
  }

  // Sort by date
  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  )

  // Overview stats
  const totalTrades = trades.length
  const winningTrades = trades.filter((t) => (t.pnl || 0) > 0)
  const losingTrades = trades.filter((t) => (t.pnl || 0) < 0)
  const winRate = (winningTrades.length / totalTrades) * 100
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const totalLosses = Math.abs(
    losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  )

  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0

  const pnlValues = trades.map((t) => t.pnl || 0)
  const bestTrade = Math.max(...pnlValues)
  const worstTrade = Math.min(...pnlValues)

  // P&L over time
  let cumulative = 0
  const pnlOverTime: PnLDataPoint[] = sorted.map((trade) => {
    cumulative += trade.pnl || 0
    return {
      date: new Date(trade.trade_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      pnl: trade.pnl || 0,
      cumulative: parseFloat(cumulative.toFixed(2)),
    }
  })

  // Session stats
  const sessions = ['london', 'newyork', 'asia', 'other']
  const sessionStats: SessionStat[] = sessions.map((session) => {
    const sessionTrades = trades.filter((t) => t.session === session)
    const sessionWins = sessionTrades.filter((t) => (t.pnl || 0) > 0)
    return {
      session: session === 'newyork' ? 'New York' : session.charAt(0).toUpperCase() + session.slice(1),
      trades: sessionTrades.length,
      wins: sessionWins.length,
      winRate: sessionTrades.length > 0
        ? parseFloat(((sessionWins.length / sessionTrades.length) * 100).toFixed(1))
        : 0,
      pnl: parseFloat(sessionTrades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)),
    }
  }).filter((s) => s.trades > 0)

  // ICT Concept stats
  const conceptMap = new Map<string, Trade[]>()
  trades.forEach((trade) => {
    if (trade.ict_concepts && trade.ict_concepts.length > 0) {
      trade.ict_concepts.forEach((concept) => {
        if (!conceptMap.has(concept)) conceptMap.set(concept, [])
        conceptMap.get(concept)!.push(trade)
      })
    }
  })

  const conceptStats: ConceptStat[] = Array.from(conceptMap.entries())
    .map(([concept, conceptTrades]) => {
      const wins = conceptTrades.filter((t) => (t.pnl || 0) > 0)
      return {
        concept,
        trades: conceptTrades.length,
        wins: wins.length,
        winRate: parseFloat(((wins.length / conceptTrades.length) * 100).toFixed(1)),
        pnl: parseFloat(conceptTrades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)),
      }
    })
    .sort((a, b) => b.trades - a.trades)

  // Entry quality stats
  const qualities = ['High Probability', 'Aggressive', 'Poor']
  const entryQualityStats: EntryQualityStat[] = qualities.map((quality) => {
    const qualityTrades = trades.filter((t) => t.entry_quality === quality)
    const wins = qualityTrades.filter((t) => (t.pnl || 0) > 0)
    return {
      quality,
      trades: qualityTrades.length,
      wins: wins.length,
      winRate: qualityTrades.length > 0
        ? parseFloat(((wins.length / qualityTrades.length) * 100).toFixed(1))
        : 0,
      pnl: parseFloat(qualityTrades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)),
    }
  }).filter((q) => q.trades > 0)

  // Daily stats
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dailyStats: DailyStat[] = days.map((day, index) => {
    const dayTrades = trades.filter(
      (t) => new Date(t.trade_date).getDay() === index
    )
    const wins = dayTrades.filter((t) => (t.pnl || 0) > 0)
    return {
      day: day.substring(0, 3),
      trades: dayTrades.length,
      wins: wins.length,
      winRate: dayTrades.length > 0
        ? parseFloat(((wins.length / dayTrades.length) * 100).toFixed(1))
        : 0,
      pnl: parseFloat(dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)),
    }
  }).filter((d) => d.trades > 0)

  // Pair stats
  const pairMap = new Map<string, Trade[]>()
  trades.forEach((trade) => {
    if (!pairMap.has(trade.pair)) pairMap.set(trade.pair, [])
    pairMap.get(trade.pair)!.push(trade)
  })

  const pairStats: PairStat[] = Array.from(pairMap.entries())
    .map(([pair, pairTrades]) => {
      const wins = pairTrades.filter((t) => (t.pnl || 0) > 0)
      return {
        pair,
        trades: pairTrades.length,
        wins: wins.length,
        winRate: parseFloat(((wins.length / pairTrades.length) * 100).toFixed(1)),
        pnl: parseFloat(pairTrades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)),
      }
    })
    .sort((a, b) => b.trades - a.trades)

  return {
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: parseFloat(winRate.toFixed(1)),
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    avgRR: parseFloat(avgRR.toFixed(2)),
    bestTrade: parseFloat(bestTrade.toFixed(2)),
    worstTrade: parseFloat(worstTrade.toFixed(2)),
    pnlOverTime,
    sessionStats,
    conceptStats,
    entryQualityStats,
    dailyStats,
    pairStats,
  }
}

function getEmptyAnalytics(): AnalyticsData {
  return {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalPnL: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    avgRR: 0,
    bestTrade: 0,
    worstTrade: 0,
    pnlOverTime: [],
    sessionStats: [],
    conceptStats: [],
    entryQualityStats: [],
    dailyStats: [],
    pairStats: [],
  }
}