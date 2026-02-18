'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TradeForm } from '@/components/trade-form'

// ✅ PropFirm type
interface PropFirm {
  id: string
  firm_name: string
  challenge_type: string
}

// ✅ Props with propFirms
interface NewTradeDialogProps {
  propFirms?: PropFirm[]
    disabled?: boolean

}

export function NewTradeDialog({ propFirms = [], disabled = false }: NewTradeDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          New Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription>
            Enter your trade details manually
          </DialogDescription>
        </DialogHeader>
        {/* ✅ Pass propFirms down to TradeForm */}
        <TradeForm onSuccess={handleSuccess} propFirms={propFirms} />
      </DialogContent>
    </Dialog>
  )
}