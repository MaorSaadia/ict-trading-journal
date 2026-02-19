/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plug, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
// import { useToast } from '@/hooks/use-toast'

interface ConnectTradovateDialogProps {
  propFirmId?: string
}

export function ConnectTradovateDialog({ propFirmId }: ConnectTradovateDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isDemo, setIsDemo] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    accounts?: any[]
    error?: string
  } | null>(null)

  const router = useRouter()
//   const { toast } = useToast()

  const handleTest = async () => {
    // if (!username || !password) {
    //   toast({
    //     title: 'Missing credentials',
    //     description: 'Please enter username and password',
    //     variant: 'destructive',
    //   })
    //   return
    // }

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/tradovate/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, demo: isDemo }),
      })

      const data = await response.json()
      setTestResult(data)

//       if (data.success) {
//         toast({
//           title: 'Connection successful!',
//           description: `Found ${data.accounts?.length || 0} accounts`,
//         })
//       } else {
//         toast({
//           title: 'Connection failed',
//           description: data.error,
//           variant: 'destructive',
//         })
//       }
    } catch (error: any) {
//       toast({
//         title: 'Test failed',
//         description: error.message,
//         variant: 'destructive',
//       })
    } finally {
      setTesting(false)
    }
  }

  const handleConnect = async () => {
    // if (!testResult?.success) {
    //   toast({
    //     title: 'Test connection first',
    //     description: 'Please test the connection before saving',
    //     variant: 'destructive',
    //   })
    //   return
    // }

    // if (!accountId) {
    //   toast({
    //     title: 'Select account',
    //     description: 'Please select an account to sync',
    //     variant: 'destructive',
    //   })
    //   return
    // }

    setLoading(true)

    try {
      const response = await fetch('/api/tradovate/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          accountId,
          isDemo,
          propFirmId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Connection failed')
      }

    //   toast({
    //     title: 'Connected!',
    //     description: 'Tradovate account connected successfully',
    //   })

      setOpen(false)
      router.refresh()
    } catch (error: any) {
    //   toast({
    //     title: 'Connection failed',
    //     description: error.message,
    //     variant: 'destructive',
    //   })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plug className="h-4 w-4" />
          Connect Tradovate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Tradovate Account</DialogTitle>
          <DialogDescription>
            Automatically sync trades from your Tradovate account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your credentials are encrypted and stored securely. We never store your password in plain text.
            </AlertDescription>
          </Alert>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <Label htmlFor="demo-mode">Demo Mode</Label>
              <p className="text-xs text-muted-foreground">
                Use demo account for testing
              </p>
            </div>
            <Switch
              id="demo-mode"
              checked={isDemo}
              onCheckedChange={setIsDemo}
            />
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            <Label htmlFor="username">Tradovate Username</Label>
            <Input
              id="username"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Tradovate Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Test Connection */}
          <Button
            onClick={handleTest}
            disabled={testing || !username || !password}
            variant="outline"
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>

          {/* Test Result */}
          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                {testResult.success
                  ? `Connection successful! Found ${testResult.accounts?.length || 0} accounts.`
                  : testResult.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Account Selection */}
          {testResult?.success && testResult.accounts && (
            <div className="space-y-2">
              <Label htmlFor="account">Select Account to Sync</Label>
              <select
                id="account"
                className="w-full p-2 border rounded-md bg-background"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Choose an account...</option>
                {testResult.accounts.map((account: any) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (ID: {account.id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Connect Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConnect}
            disabled={loading || !testResult?.success || !accountId}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Account'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}