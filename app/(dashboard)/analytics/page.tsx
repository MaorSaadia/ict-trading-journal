import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { User, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'
import { calculateAnalytics } from '@/lib/analytics'
import { PnLChart } from '@/components/analytics/pnl-chart'
import { SessionChart } from '@/components/analytics/session-chart'
import { ConceptChart } from '@/components/analytics/concept-chart'
import { EntryQualityChart } from '@/components/analytics/entry-quality-chart'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all trades
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: true })

  const analytics = calculateAnalytics(trades || [])

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            ICT Trading Journal
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
            <form action={handleSignOut}>
              <Button variant="outline">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent">
                Dashboard
              </Button>
            </Link>
            <Link href="/journal">
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent">
                Journal
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="rounded-none border-b-2 border-primary">
                Analytics
              </Button>
            </Link>
            <Link href="/prop-firms">
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent" disabled>
                Prop Firms
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Your trading performance breakdown
            </p>
          </div>

          {analytics.totalTrades === 0 ? (
            <div className="border rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium mb-2">No trades to analyze</h3>
              <p className="text-muted-foreground mb-4">
                Add some trades to your journal to see analytics
              </p>
              <Link href="/journal">
                <Button>Go to Journal</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Overview Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Win Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{analytics.winRate}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.winningTrades}W / {analytics.losingTrades}L
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total P&L
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${
                      analytics.totalPnL >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {analytics.totalPnL >= 0 ? '+' : ''}${analytics.totalPnL}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.totalTrades} total trades
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Profit Factor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${
                      analytics.profitFactor >= 1
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {analytics.profitFactor}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Above 1.5 is good
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Risk/Reward
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {analytics.avgRR > 0 ? `1:${analytics.avgRR}` : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg win / avg loss
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Avg Win
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +${analytics.avgWin}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Avg Loss
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      -${analytics.avgLoss}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Best Trade
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +${analytics.bestTrade}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-red-500" />
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Worst Trade
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${analytics.worstTrade}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid md:grid-cols-1 gap-6">
                <PnLChart data={analytics.pnlOverTime} />
              </div>

              {/* Charts Row 2 */}
              <div className="grid md:grid-cols-2 gap-6">
                <SessionChart data={analytics.sessionStats} />
                <EntryQualityChart data={analytics.entryQualityStats} />
              </div>

              {/* Charts Row 3 */}
              <div className="grid md:grid-cols-1 gap-6">
                <ConceptChart data={analytics.conceptStats} />
              </div>

              {/* Pair Performance Table */}
              {analytics.pairStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance by Pair</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.pairStats.map((pair) => (
                        <div
                          key={pair.pair}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-medium w-20">{pair.pair}</span>
                            <span className="text-sm text-muted-foreground">
                              {pair.trades} trades
                            </span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Win Rate</p>
                              <p className={`text-sm font-medium ${
                                pair.winRate >= 50
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {pair.winRate}%
                              </p>
                            </div>
                            <div className="text-right w-24">
                              <p className="text-xs text-muted-foreground">P&L</p>
                              <p className={`text-sm font-medium ${
                                pair.pnl >= 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {pair.pnl >= 0 ? '+' : ''}${pair.pnl}
                              </p>
                            </div>
                            {/* Win rate progress bar */}
                            <div className="w-24 hidden md:block">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pair.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${pair.winRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}