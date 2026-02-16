'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TradeForm } from '@/components/trade-form'
import type { Trade } from '@/lib/types'

interface TradesListProps {
  trades: Trade[]
}

export function TradesList({ trades }: TradesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)
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
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>Session</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>
                  {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="font-medium">{trade.pair}</TableCell>
                <TableCell>
                  <Badge
                    variant={trade.direction === 'long' ? 'default' : 'secondary'}
                  >
                    {trade.direction}
                  </Badge>
                </TableCell>
                <TableCell>{trade.entry_price?.toFixed(5)}</TableCell>
                <TableCell>{trade.exit_price?.toFixed(5)}</TableCell>
                <TableCell>{trade.lot_size}</TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      (trade.pnl || 0) >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    ${trade.pnl?.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {trade.session}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
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
              Are you sure you want to delete this trade? This action cannot be undone.
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