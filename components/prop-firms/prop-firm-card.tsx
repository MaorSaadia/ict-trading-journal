/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  Target,
  Shield,
  Badge,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Plug, RefreshCw, Loader2 } from 'lucide-react'
import { ConnectTradovateDialog } from '../tradovate/connect-dialog'
// import { useToast } from '@/hooks/use-toast'

interface Trade {
  id: string
  pnl: number | null
  trade_date: string
  pair: string
  direction: string
}

interface PropFirmChallenge {
  last_sync_at: any
  auto_sync_enabled: any
  id: string
  firm_name: string
  challenge_type: string
  account_size: number
  current_balance: number
  profit_target: number
  daily_loss_limit: number
  max_loss_limit: number
  status: string
  start_date: string
  end_date: string | null
  trades: Trade[]
}

interface PropFirmCardProps {
  challenge: PropFirmChallenge
}

export function PropFirmCard({ challenge }: PropFirmCardProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Calculate stats from linked trades
  const trades = challenge.trades || []
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const currentBalance = challenge.account_size + totalPnL

  // Today's P&L
  const today = new Date().toDateString()
  const todayTrades = trades.filter(
    (t) => new Date(t.trade_date).toDateString() === today
  )
  const todayPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  // Progress calculations
  const profitProgress = Math.min(
    (totalPnL / challenge.profit_target) * 100,
    100
  )
  const dailyLossProgress = Math.min(
    (Math.abs(Math.min(todayPnL, 0)) / challenge.daily_loss_limit) * 100,
    100
  )
  const maxLossProgress = Math.min(
    (Math.abs(Math.min(totalPnL, 0)) / challenge.max_loss_limit) * 100,
    100
  )

  // Rule violation checks
  const isDailyLossWarning = dailyLossProgress >= 70
  const isDailyLossBreached = Math.abs(Math.min(todayPnL, 0)) >= challenge.daily_loss_limit
  const isMaxLossWarning = maxLossProgress >= 70
  const isMaxLossBreached = Math.abs(Math.min(totalPnL, 0)) >= challenge.max_loss_limit
  const isProfitTargetReached = totalPnL >= challenge.profit_target

  // Days trading
  const daysTrading = differenceInDays(new Date(), new Date(challenge.start_date)) + 1

  // Status color
  const statusConfig = {
    active: { color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400', label: 'Active' },
    passed: { color: 'bg-green-500/20 text-green-700 dark:text-green-400', label: 'Passed ✓' },
    failed: { color: 'bg-red-500/20 text-red-700 dark:text-red-400', label: 'Failed' },
    breached: { color: 'bg-red-500/20 text-red-700 dark:text-red-400', label: 'Breached' },
  }
  const status = statusConfig[challenge.status as keyof typeof statusConfig] || statusConfig.active

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('prop_firm_challenges')
        .delete()
        .eq('id', challenge.id)
      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleMarkPassed = async () => {
    await supabase
      .from('prop_firm_challenges')
      .update({ status: 'passed', end_date: new Date().toISOString() })
      .eq('id', challenge.id)
    router.refresh()
  }

  const handleMarkFailed = async () => {
    await supabase
      .from('prop_firm_challenges')
      .update({ status: 'failed', end_date: new Date().toISOString() })
      .eq('id', challenge.id)
    router.refresh()
  }

const [syncing, setSyncing] = useState(false)

const handleManualSync = async () => {
  setSyncing(true)
  try {
    const { data: connection } = await supabase
      .from('tradovate_connections')
      .select('id')
      .eq('prop_firm_id', challenge.id)
      .single()

    if (!connection) {
      // toast({
      //   title: 'No connection found',
      //   description: 'Please connect your Tradovate account first',
      //   variant: 'destructive',
      // })
      console.log('No connection found for prop firm ID:', challenge.id);
      return
    }

    const response = await fetch('/api/tradovate/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId: connection.id }),
    })

    const result = await response.json()

    if (result.success) {
      // toast({
      //   title: 'Sync complete!',
      //   description: `${result.newTrades} new trades imported, ${result.updatedTrades} updated`,
      // })
console.log('Sync result:', result);

      router.refresh()
    } else {
      // toast({
      //   title: 'Sync completed with errors',
      //   description: `${result.errors.length} errors occurred`,
      //   variant: 'destructive',
      // })
      console.log('Sync errors:', result.errors);
    }
  } catch (error: any) {
    // toast({
    //   title: 'Sync failed',
    //   description: error.message,
    //   variant: 'destructive',
    // })
    console.log('Sync error:', error);
  } finally {
    setSyncing(false)
  }
}

  return (
    <>
      <Card className={`relative overflow-hidden ${
        isMaxLossBreached || isDailyLossBreached
          ? 'border-red-500/50'
          : isProfitTargetReached
          ? 'border-green-500/50'
          : ''
      }`}>
        {/* Top colored bar based on status */}
        <div className={`h-1 w-full ${
          challenge.status === 'passed' ? 'bg-green-500' :
          challenge.status === 'failed' || challenge.status === 'breached' ? 'bg-red-500' :
          isProfitTargetReached ? 'bg-green-500' :
          isMaxLossBreached ? 'bg-red-500' :
          'bg-blue-500'
        }`} />

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{challenge.firm_name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {challenge.challenge_type} •{' '}
                ${challenge.account_size.toLocaleString()} Account
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMarkPassed}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Mark as Passed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkFailed}>
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Mark as Failed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteId(challenge.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete Challenge
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Balance Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className={`text-lg font-bold ${
                currentBalance >= challenge.account_size
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${currentBalance.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">P&L</p>
              <p className={`text-lg font-bold ${
                totalPnL >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Today</p>
              <p className={`text-lg font-bold ${
                todayPnL >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Profit Target Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-green-500" />
                <span className="font-medium">Profit Target</span>
              </div>
              <span className="text-muted-foreground">
                ${Math.max(totalPnL, 0).toFixed(2)} / ${challenge.profit_target.toLocaleString()}
              </span>
            </div>
            <Progress
              value={Math.max(profitProgress, 0)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground text-right">
              {profitProgress >= 100
                ? '🎉 Target reached!'
                : `$${(challenge.profit_target - Math.max(totalPnL, 0)).toFixed(2)} remaining`}
            </p>
          </div>

          {/* Daily Loss Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                {isDailyLossBreached ? (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                ) : isDailyLossWarning ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span className="font-medium">Daily Loss</span>
                {isDailyLossBreached && (
                  <span className="text-xs text-red-500 font-medium">BREACHED!</span>
                )}
                {isDailyLossWarning && !isDailyLossBreached && (
                  <span className="text-xs text-yellow-500 font-medium">WARNING</span>
                )}
              </div>
              <span className="text-muted-foreground">
                ${Math.abs(Math.min(todayPnL, 0)).toFixed(2)} / ${challenge.daily_loss_limit.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <Progress
                value={dailyLossProgress}
                className={`h-2 ${
                  isDailyLossBreached ? '[&>div]:bg-red-500' :
                  isDailyLossWarning ? '[&>div]:bg-yellow-500' :
                  '[&>div]:bg-blue-500'
                }`}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              ${(challenge.daily_loss_limit - Math.abs(Math.min(todayPnL, 0))).toFixed(2)} remaining today
            </p>
          </div>

          {/* Max Drawdown Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                {isMaxLossBreached ? (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                ) : isMaxLossWarning ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-purple-500" />
                )}
                <span className="font-medium">Max Drawdown</span>
                {isMaxLossBreached && (
                  <span className="text-xs text-red-500 font-medium">BREACHED!</span>
                )}
                {isMaxLossWarning && !isMaxLossBreached && (
                  <span className="text-xs text-yellow-500 font-medium">WARNING</span>
                )}
              </div>
              <span className="text-muted-foreground">
                ${Math.abs(Math.min(totalPnL, 0)).toFixed(2)} / ${challenge.max_loss_limit.toLocaleString()}
              </span>
            </div>
            <Progress
              value={maxLossProgress}
              className={`h-2 ${
                isMaxLossBreached ? '[&>div]:bg-red-500' :
                isMaxLossWarning ? '[&>div]:bg-yellow-500' :
                '[&>div]:bg-purple-500'
              }`}
            />
            <p className="text-xs text-muted-foreground text-right">
              ${(challenge.max_loss_limit - Math.abs(Math.min(totalPnL, 0))).toFixed(2)} remaining
            </p>
          </div>
{/* Tradovate Sync Section */}
<div className="pt-4 border-t space-y-3">
  {challenge.auto_sync_enabled ? (
    // Connected - show sync status
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Tradovate Sync</span>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualSync}
          disabled={syncing}
        >
          {syncing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Now
            </>
          )}
        </Button>
      </div>
      {challenge.last_sync_at && (
        <p className="text-xs text-muted-foreground">
          Last synced: {format(new Date(challenge.last_sync_at), 'MMM d, yyyy HH:mm')}
        </p>
      )}
    </div>
  ) : (
    // Not connected - show connect button
    <div className="text-center py-2">
      <p className="text-xs text-muted-foreground mb-3">
        Connect Tradovate to auto-sync trades
      </p>
      <ConnectTradovateDialog propFirmId={challenge.id} />
    </div>
  )}
</div>

{challenge.auto_sync_enabled && (
  <div className="pt-4 border-t">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Plug className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">Tradovate Sync</span>
        <Badge variant="secondary" className="text-xs">Active</Badge>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleManualSync}
        disabled={syncing}
      >
        {syncing ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </>
        )}
      </Button>
    </div>
    {challenge.last_sync_at && (
      <p className="text-xs text-muted-foreground">
        Last synced: {format(new Date(challenge.last_sync_at), 'MMM d, yyyy HH:mm')}
      </p>
    )}
  </div>
)}
          {/* Footer stats */}
          <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Day {daysTrading} • Started {format(new Date(challenge.start_date), 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{trades.length} linked trades</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this challenge? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}