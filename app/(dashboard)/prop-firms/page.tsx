import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { User } from 'lucide-react'
import { NewPropFirmDialog } from '@/components/prop-firms/new-prop-firm-dialog'
import { PropFirmCard } from '@/components/prop-firms/prop-firm-card'

export default async function PropFirmsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all prop firm challenges with their linked trades
  const { data: challenges } = await supabase
    .from('prop_firm_challenges')
    .select(`
      *,
      trades (
        id,
        pnl,
        trade_date,
        pair,
        direction
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
              <Button variant="ghost" className="rounded-none border-b-2 border-transparent">
                Analytics
              </Button>
            </Link>
            <Link href="/prop-firms">
              <Button variant="ghost" className="rounded-none border-b-2 border-primary">
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
              <h1 className="text-3xl font-bold">Prop Firm Tracker</h1>
              <p className="text-muted-foreground">
                Track your funded account challenges
              </p>
            </div>
            <NewPropFirmDialog />
          </div>

          {!challenges || challenges.length === 0 ? (
            <div className="border rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first prop firm challenge to start tracking
              </p>
              <NewPropFirmDialog />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <PropFirmCard
                  key={challenge.id}
                  challenge={challenge}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}