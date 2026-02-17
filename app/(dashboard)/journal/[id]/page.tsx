import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { AIAnalysisDisplay } from '@/components/ai-analysis-display'
import { AnalyzeButton } from '@/components/analyze-button'
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Target,
} from 'lucide-react'

export default async function TradeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trade } = await supabase
    .from('trades')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!trade) notFound()

  // Fetch linked prop firm if exists
  const { data: propFirm } = trade.prop_firm_id
    ? await supabase
        .from('prop_firm_challenges')
        .select('firm_name, challenge_type')
        .eq('id', trade.prop_firm_id)
        .single()
    : { data: null }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  const isWin = (trade.pnl || 0) > 0

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

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Back button */}
          <Link href="/journal">
            <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to Journal
            </Button>
          </Link>

          {/* Trade Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{trade.pair}</h1>
                <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'} className="text-sm">
                  {trade.direction}
                </Badge>
                {trade.entry_quality && (
                  <Badge className={`text-sm border-0
                    ${trade.entry_quality === 'High Probability' ? 'bg-green-500/20 text-green-700 dark:text-green-400' : ''}
                    ${trade.entry_quality === 'Aggressive' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : ''}
                    ${trade.entry_quality === 'Poor' ? 'bg-red-500/20 text-red-700 dark:text-red-400' : ''}
                  `}>
                    {trade.entry_quality}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(trade.trade_date), 'MMMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">{trade.session} Session</span>
                </div>
                {propFirm && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {propFirm.firm_name} — {propFirm.challenge_type}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className={`text-4xl font-bold ${isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isWin ? '+' : ''}${trade.pnl?.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isWin ? '✅ Win' : '❌ Loss'}
              </p>
            </div>
          </div>

          {/* Trade Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Entry Price</p>
                <p className="text-lg font-bold font-mono">{trade.entry_price?.toFixed(5)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Exit Price</p>
                <p className="text-lg font-bold font-mono">{trade.exit_price?.toFixed(5)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Lot Size</p>
                <p className="text-lg font-bold">{trade.lot_size}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">ICT Concepts</p>
                <p className="text-lg font-bold">{trade.ict_concepts?.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Screenshot */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Trade Screenshot</h2>
                <AnalyzeButton
                  tradeId={trade.id}
                  hasImage={!!trade.image_url}
                  hasAnalysis={!!trade.ai_analysis}
                />
              </div>

              {trade.image_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={trade.image_url}
                    alt="Trade screenshot"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">No screenshot uploaded</p>
                    <Link href="/journal">
                      <Button variant="outline" size="sm" className="mt-2">
                        Edit Trade to Add
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* ICT Concepts Tags */}
              {trade.ict_concepts && trade.ict_concepts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trade.ict_concepts.map((concept: string) => (
                    <Badge key={concept} variant="secondary">{concept}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Trade Notes</h2>
              <Card className="h-full min-h-50">
                <CardContent className="pt-4">
                  {trade.user_notes ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {trade.user_notes}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      No notes for this trade.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Analysis */}
          {trade.ai_analysis ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">AI Analysis</h2>
                <span className="text-xs text-muted-foreground">
                  Analyzed {format(new Date(trade.ai_analysis.analyzedAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <AIAnalysisDisplay analysis={trade.ai_analysis} />
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center space-y-3">
                <p className="text-muted-foreground">
                  No AI analysis yet for this trade
                </p>
                {trade.image_url ? (
                  <AnalyzeButton
                    tradeId={trade.id}
                    hasImage={!!trade.image_url}
                    hasAnalysis={false}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Upload a screenshot to enable AI analysis
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}