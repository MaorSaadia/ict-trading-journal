import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
            <ThemeToggle />
            <form action={handleSignOut}>
              <Button variant="outline">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{profile?.email || user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                  <p className="text-base">{profile?.display_name || 'Not set'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subscription Tier</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${profile?.subscription_tier === 'free' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' : ''}
                      ${profile?.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                      ${profile?.subscription_tier === 'premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' : ''}
                    `}>
                      {profile?.subscription_tier || 'free'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-base">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.subscription_tier === 'free' && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Free Plan</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 10 trades per month</li>
                      <li>• Basic AI analysis</li>
                      <li>• Manual trade entry</li>
                    </ul>
                  </div>
                  <Button className="w-full" disabled>
                    Upgrade to Pro (Coming Soon)
                  </Button>
                </div>
              )}

              {profile?.subscription_tier === 'pro' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Pro Plan - $29/month</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Unlimited trades</li>
                      <li>• AI screenshot analysis</li>
                      <li>• Advanced analytics</li>
                      <li>• 1 prop firm tracker</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    Manage Subscription (Coming Soon)
                  </Button>
                </div>
              )}

              {profile?.subscription_tier === 'premium' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Premium Plan - $59/month</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Everything in Pro</li>
                      <li>• 5 prop firm trackers</li>
                      <li>• Priority AI analysis</li>
                      <li>• Study materials access</li>
                      <li>• Community access</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    Manage Subscription (Coming Soon)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}