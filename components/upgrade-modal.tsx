'use client'

import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
  currentUsage?: string
}

export function UpgradeModal({
  open,
  onOpenChange,
  feature,
  currentUsage,
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Upgrade to Continue</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;ve reached your free tier limit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">{feature}</p>
            {currentUsage && (
              <p className="text-xs text-muted-foreground">{currentUsage}</p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Upgrade to Pro for:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                Unlimited trades per month
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                Unlimited AI analyses
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                Advanced analytics
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Link href="/pricing" className="flex-1">
            <Button className="w-full">
              View Plans
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
