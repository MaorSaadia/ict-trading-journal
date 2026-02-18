import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { User } from 'lucide-react'
import { TradesList } from '@/components/trades-list'
import { NewTradeDialog } from '@/components/new-trade-dialog'

export default async function JournalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

// Add at top after getting user
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_tier')
  .eq('id', user.id)
  .single()

// Check if at limit
const startOfMonth = new Date()
startOfMonth.setDate(1)
startOfMonth.setHours(0, 0, 0, 0)

const { count: tradesThisMonth } = await supabase
  .from('trades')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', startOfMonth.toISOString())

const tier = profile?.subscription_tier || 'free'
const isAtLimit = tier === 'free' && (tradesThisMonth || 0) >= 10

  // Fetch all trades
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })

  // ✅ Fetch active prop firm challenges to show in trade form
  const { data: propFirms } = await supabase
    .from('prop_firm_challenges')
    .select('id, firm_name, challenge_type')
    .eq('user_id', user.id)
    .eq('status', 'active')

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
              <Button variant="ghost" className="rounded-none border-b-2 border-primary">
                Journal
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent">
                Analytics
              </Button>
            </Link>
            <Link href="/prop-firms">
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent">
                Prop Firms
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Trading Journal</h1>
              <p className="text-muted-foreground">
                Track and analyze your trades
              </p>
            </div>
            {/* ✅ Pass propFirms to dialog */}
<NewTradeDialog propFirms={propFirms || []} disabled={isAtLimit} />
          </div>
{isAtLimit && (
  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-yellow-800 dark:text-yellow-400">
          Free Tier Limit Reached
        </p>
        <p className="text-sm text-yellow-700 dark:text-yellow-500">
          You&apos;ve used all 10 trades this month. Upgrade to Pro for unlimited trades.
        </p>
      </div>
      <Link href="/pricing">
        <Button>Upgrade Now</Button>
      </Link>
    </div>
  </div>
)}
          <TradesList trades={trades || []} propFirms={propFirms || []} />
        </div>
      </main>
    </div>
  )
}