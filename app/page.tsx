import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Brain,
  Target,
  Sparkles,
  Check,
  BarChart3,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="mb-2">AI-Powered Trading Journal</Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Master ICT Trading with{' '}
              <span className="text-primary">AI Analysis</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your trades, get instant ICT feedback, and manage prop firm challenges—all in one place.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Free
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Free forever · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything You Need to Trade Like ICT</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Inner Circle Trader methodology with AI that understands Market Structure, FVG, Order Blocks, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI Trade Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your chart screenshot and get instant ICT feedback on MSS, FVG, entry quality, and what to improve.
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Market Structure Shift detection
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Fair Value Gap identification
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Entry quality scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold">Prop Firm Tracker</h3>
                <p className="text-sm text-muted-foreground">
                  Track multiple prop firm challenges with real-time balance updates and automatic rule violation warnings.
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Daily loss monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Max drawdown alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Profit target tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Dive deep into your performance with charts, win rates by session, concept analysis, and more.
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    P&L over time
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Session performance
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    ICT concept breakdown
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="border-y py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Simple Pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you&apos;re ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Free</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    10 trades/month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    10 AI analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    1 prop firm tracker
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant="outline">Start Free</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Most Popular</Badge>
              </div>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <strong>Unlimited</strong> trades
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <strong>Unlimited</strong> AI analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Advanced analytics
                  </li>
                </ul>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Premium
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$59</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    5 prop firm trackers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    ICT study materials
                  </li>
                </ul>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">
              Ready to Improve Your Trading?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join traders using AI to master ICT methodology
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Free
                <TrendingUp className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 ICT Trading Journal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}