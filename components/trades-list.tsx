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
  TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TradeForm } from '@/components/trade-form'
import { AnalyzeButton } from '@/components/analyze-button'
import { AIAnalysisDisplay } from '@/components/ai-analysis-display'
import type { Trade } from '@/lib/types'
import Link from 'next/link'

// ✅ PropFirm type
interface PropFirm {
  id: string
  firm_name: string
  challenge_type: string
}

interface TradesListProps {
  trades: Trade[]
  propFirms?: PropFirm[] // ✅ Added prop
}

export function TradesList({ trades, propFirms = [] }: TradesListProps) {
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
    <div className="border rounded-lg border-dashed p-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <TrendingUp className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">No trades yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Start tracking your trades to get AI-powered ICT analysis and performance insights.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Click &quot;New Trade&quot; above to add your first trade
      </p>
    </div>
  )
}

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        {/* Header row */}
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

  <Link href={`/journal/${trade.id}`} className="text-sm hover:underline hover:text-primary transition-colors">
  {format(new Date(trade.trade_date), 'MMM d, yyyy')}
</Link>

<Link href={`/journal/${trade.id}`} className="font-medium text-sm hover:underline hover:text-primary transition-colors">
  {trade.pair}
</Link>
                <div>
                  <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
                    {trade.direction}
                  </Badge>
                </div>

                <div className="text-sm font-mono">{trade.entry_price?.toFixed(5)}</div>
                <div className="text-sm font-mono">{trade.exit_price?.toFixed(5)}</div>
                <div className="text-sm">{trade.lot_size}</div>

                <div>
                  <span className={`font-semibold text-sm ${
                    (trade.pnl || 0) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="capitalize text-xs w-fit">
                    {trade.session}
                  </Badge>
                  {trade.entry_quality && (
                    <Badge className={`text-xs w-fit border-0
                      ${trade.entry_quality === 'High Probability' ? 'bg-green-500/20 text-green-700 dark:text-green-400' : ''}
                      ${trade.entry_quality === 'Aggressive' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : ''}
                      ${trade.entry_quality === 'Poor' ? 'bg-red-500/20 text-red-700 dark:text-red-400' : ''}
                    `}>
                      {trade.entry_quality}
                    </Badge>
                  )}
                </div>

                <div className="relative z-10">
                  <AnalyzeButton
                    tradeId={trade.id}
                    hasImage={!!trade.image_url}
                    hasAnalysis={!!trade.ai_analysis}
                  />
                </div>

                <div className="flex items-center gap-1">
                  {trade.ai_analysis && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
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

              {/* AI Analysis Panel */}
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

      {/* ✅ Edit Dialog - passes propFirms so selector shows */}
      <Dialog open={!!editTrade} onOpenChange={() => setEditTrade(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
          </DialogHeader>
          {editTrade && (
            <TradeForm
              trade={editTrade}
              onSuccess={handleEditSuccess}
              propFirms={propFirms}
            />
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