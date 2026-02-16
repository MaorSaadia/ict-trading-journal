import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { User } from 'lucide-react'
import { TradesList } from '@/components/trades-list'
import { NewTradeDialog } from '@/components/new-trade-dialog'

export default async function JournalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all trades
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })

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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Trading Journal</h1>
              <p className="text-muted-foreground">
                Track and analyze your trades
              </p>
            </div>
            <NewTradeDialog />
          </div>

          <TradesList trades={trades || []} />
        </div>
      </main>
    </div>
  )
}