import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
            <ThemeToggle />
            <form action={handleSignOut}>
              <Button variant="outline">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Trades</CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Win Rate</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total P&L</CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$0.00</p>
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
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">2</span>
                </div>
                <span className="text-muted-foreground">Add your first trade (Coming soon)</span>
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