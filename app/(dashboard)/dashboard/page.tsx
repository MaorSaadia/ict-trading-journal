import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { User } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch basic stats
  const { count: totalTrades } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: trades } = await supabase
    .from('trades')
    .select('pnl')
    .eq('user_id', user.id)

  const totalPnL = trades?.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0
  const winningTrades = trades?.filter(trade => (trade.pnl || 0) > 0).length || 0
  const winRate = totalTrades ? ((winningTrades / totalTrades) * 100).toFixed(0) : 0

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
          <h2 className="text-xl font-bold">ICT Trading Journal</h2>
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
              <Button variant="ghost" className="rounded-none border-b-2 border-primary">
                Dashboard
              </Button>
            </Link>
            <Link href="/journal">
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent">
                Journal
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent" disabled>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.display_name || user.email}
                {profile?.subscription_tier && (
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                    ${profile.subscription_tier === 'free' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' : ''}
                    ${profile.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                    ${profile.subscription_tier === 'premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' : ''}
                  `}>
                    {profile.subscription_tier}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Trades</CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalTrades || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Win Rate</CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{winRate}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total P&L</CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${
                  totalPnL >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ${totalPnL.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete these steps to set up your journal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                </div>
                <span>Create your account</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  totalTrades && totalTrades > 0
                    ? 'bg-green-500/20'
                    : 'bg-muted'
                }`}>
                  <span className={totalTrades && totalTrades > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                    {totalTrades && totalTrades > 0 ? '✓' : '2'}
                  </span>
                </div>
                <Link href="/journal" className="hover:underline">
                  <span className={totalTrades && totalTrades > 0 ? '' : 'text-muted-foreground'}>
                    Add your first trade {totalTrades && totalTrades > 0 ? '(Complete!)' : ''}
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">3</span>
                </div>
                <span className="text-muted-foreground">Get AI feedback (Coming soon)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
