'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MoreVertical,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TradeForm } from '@/components/trade-form'
import { AnalyzeButton } from '@/components/analyze-button'
import { AIAnalysisDisplay } from '@/components/ai-analysis-display'
import type { Trade } from '@/lib/types'

interface TradesListProps {
  trades: Trade[]
}

export function TradesList({ trades }: TradesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)
  const [viewImage, setViewImage] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', deleteId)
      if (error) throw error
      setDeleteId(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting trade:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleEditSuccess = () => {
    setEditTrade(null)
    router.refresh()
  }

  if (trades.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <h3 className="text-lg font-medium mb-2">No trades yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by adding your first trade
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Header row */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[40px_120px_80px_80px_100px_100px_60px_80px_120px_140px_80px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
          <div></div>
          <div>Date</div>
          <div>Pair</div>
          <div>Direction</div>
          <div>Entry</div>
          <div>Exit</div>
          <div>Size</div>
          <div>P&L</div>
          <div>Session</div>
          <div>AI</div>
          <div></div>
        </div>

        <div className="divide-y">
          {trades.map((trade) => (
            <div key={trade.id}>
              {/* Trade Row */}
              <div className="grid grid-cols-[40px_120px_80px_80px_100px_100px_60px_80px_120px_140px_80px] gap-2 px-4 py-3 items-center hover:bg-muted/20 transition-colors">

                {/* Screenshot icon */}
                <div>
                  {trade.image_url ? (
                    <button
                      type="button"
                      onClick={() => setViewImage(trade.image_url)}
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 text-primary" />
                    </button>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="text-sm">
                  {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                </div>

                {/* Pair */}
                <div className="font-medium text-sm">{trade.pair}</div>

                {/* Direction */}
                <div>
                  <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
                    {trade.direction}
                  </Badge>
                </div>

                {/* Entry */}
                <div className="text-sm font-mono">{trade.entry_price?.toFixed(5)}</div>

                {/* Exit */}
                <div className="text-sm font-mono">{trade.exit_price?.toFixed(5)}</div>

                {/* Size */}
                <div className="text-sm">{trade.lot_size}</div>

                {/* P&L */}
                <div>
                  <span className={`font-semibold text-sm ${
                    (trade.pnl || 0) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                  </span>
                </div>

                {/* Session + Entry Quality */}
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="capitalize text-xs w-fit">
                    {trade.session}
                  </Badge>
                  {trade.entry_quality && (
                    <Badge className={`text-xs w-fit border-0
                      ${trade.entry_quality === 'High Probability'
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : ''}
                      ${trade.entry_quality === 'Aggressive'
                        ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                        : ''}
                      ${trade.entry_quality === 'Poor'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                        : ''}
                    `}>
                      {trade.entry_quality}
                    </Badge>
                  )}
                </div>

                {/* ✅ FIX 1: Analyze Button - wrapped in div with z-index to fix clickability */}
                <div className="relative z-10">
                  <AnalyzeButton
                    tradeId={trade.id}
                    hasImage={!!trade.image_url}
                    hasAnalysis={!!trade.ai_analysis}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Expand AI analysis toggle */}
                  {trade.ai_analysis && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(
                        expandedId === trade.id ? null : trade.id
                      )}
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors"
                    >
                      {expandedId === trade.id
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTrade(trade)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(trade.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Expandable AI Analysis Panel */}
              {expandedId === trade.id && trade.ai_analysis && (
                <div className="px-6 pb-6 bg-muted/10 border-t">
                  <div className="pt-4 max-w-3xl">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      🤖 AI Analysis
                      <span className="text-xs text-muted-foreground font-normal">
                        {trade.ai_analysis.analyzedAt
                          ? format(new Date(trade.ai_analysis.analyzedAt), 'MMM d, yyyy HH:mm')
                          : ''}
                      </span>
                    </h3>
                    <AIAnalysisDisplay analysis={trade.ai_analysis} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Viewer */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Trade Screenshot</DialogTitle>
          </DialogHeader>
          {viewImage && (
            <div className="relative aspect-video w-full">
              <Image
                src={viewImage}
                alt="Trade screenshot"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ FIX 3: Edit Dialog - passes full trade including image_url */}
      <Dialog open={!!editTrade} onOpenChange={() => setEditTrade(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
          </DialogHeader>
          {editTrade && (
            <TradeForm trade={editTrade} onSuccess={handleEditSuccess} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This cannot be undone.
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