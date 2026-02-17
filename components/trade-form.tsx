/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/image-upload'
import { createClient } from '@/lib/supabase/client'
import { uploadTradeImage, deleteTradeImage } from '@/lib/upload-image'
import type { Trade } from '@/lib/types'

// ✅ Schema includes prop_firm_id
const tradeSchema = z.object({
  prop_firm_id: z.string().optional(),
  trade_date: z.string().min(1, 'Date is required'),
  pair: z.string().min(1, 'Pair is required'),
  direction: z.enum(['long', 'short']).catch('long'),
  entry_price: z.string().min(1, 'Entry price is required'),
  exit_price: z.string().min(1, 'Exit price is required'),
  lot_size: z.string().min(1, 'Lot size is required'),
  session: z.enum(['london', 'newyork', 'asia', 'other']).catch('other'),
  user_notes: z.string().optional(),
})

type TradeFormData = z.infer<typeof tradeSchema>

// ✅ PropFirm type defined here
interface PropFirm {
  id: string
  firm_name: string
  challenge_type: string
}

// ✅ Props interface with propFirms properly typed
interface TradeFormProps {
  trade?: Trade
  onSuccess: () => void
  propFirms?: PropFirm[] // ← This was missing before!
}

export function TradeForm({ trade, onSuccess, propFirms = [] }: TradeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    trade?.image_url || null
  )
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  // ✅ Track selected prop firm in local state (not just form state)
  const [selectedPropFirm, setSelectedPropFirm] = useState<string>(
    trade?.prop_firm_id || 'none'
  )

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: trade
      ? {
          prop_firm_id: trade.prop_firm_id || '',
          trade_date: new Date(trade.trade_date).toISOString().split('T')[0],
          pair: trade.pair,
          direction: trade.direction,
          entry_price: trade.entry_price?.toString() || '',
          exit_price: trade.exit_price?.toString() || '',
          lot_size: trade.lot_size?.toString() || '',
          session: trade.session || 'other',
          user_notes: trade.user_notes || '',
        }
      : {
          prop_firm_id: '',
          trade_date: new Date().toISOString().split('T')[0],
          direction: 'long',
          session: 'newyork',
          user_notes: '',
        },
  })

  const direction = watch('direction')
  const session = watch('session')

  const handleImageChange = (file: File | null) => {
    if (file === null) {
      setNewImageFile(null)
      setRemoveImage(true)
      setCurrentImageUrl(null)
    } else {
      setNewImageFile(file)
      setRemoveImage(false)
    }
  }

  const onSubmit = async (data: TradeFormData) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      let finalImageUrl: string | null = currentImageUrl

      // Upload new image if selected
      if (newImageFile) {
        finalImageUrl = await uploadTradeImage(newImageFile, user.id)
        if (trade?.image_url && trade.image_url !== finalImageUrl) {
          try {
            await deleteTradeImage(trade.image_url, user.id)
          } catch (err) {
            console.error('Error deleting old image:', err)
          }
        }
      }

      // Delete image if removed
      if (removeImage && trade?.image_url) {
        try {
          await deleteTradeImage(trade.image_url, user.id)
        } catch (err) {
          console.error('Error deleting image:', err)
        }
        finalImageUrl = null
      }

      // Calculate P&L
      const entryPrice = parseFloat(data.entry_price)
      const exitPrice = parseFloat(data.exit_price)
      const lotSize = parseFloat(data.lot_size)

      const pnl = data.direction === 'long'
        ? (exitPrice - entryPrice) * lotSize
        : (entryPrice - exitPrice) * lotSize

      const tradeData = {
        user_id: user.id,
        image_url: finalImageUrl,
        trade_date: new Date(data.trade_date).toISOString(),
        pair: data.pair.toUpperCase(),
        direction: data.direction,
        entry_price: entryPrice,
        exit_price: exitPrice,
        lot_size: lotSize,
        pnl: pnl,
        session: data.session,
        user_notes: data.user_notes || null,
        // ✅ Only save prop firm ID if one was actually selected
        prop_firm_id: selectedPropFirm && selectedPropFirm !== 'none'
          ? selectedPropFirm
          : null,
      }

      if (trade) {
        const { error } = await supabase
          .from('trades')
          .update(tradeData)
          .eq('id', trade.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('trades')
          .insert([tradeData])
        if (error) throw error
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Trade Screenshot (Optional)</Label>
        <ImageUpload
          value={currentImageUrl}
          onChange={handleImageChange}
          disabled={loading}
        />
      </div>

      {/* Date & Pair */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trade_date">Trade Date</Label>
          <Input
            id="trade_date"
            type="date"
            {...register('trade_date')}
          />
          {errors.trade_date && (
            <p className="text-sm text-destructive">{errors.trade_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pair">Pair / Symbol</Label>
          <Input
            id="pair"
            placeholder="EURUSD, NQ, ES..."
            {...register('pair')}
          />
          {errors.pair && (
            <p className="text-sm text-destructive">{errors.pair.message}</p>
          )}
        </div>
      </div>

      {/* Direction & Session */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Direction</Label>
          <Select
            value={direction}
            onValueChange={(value) => setValue('direction', value as 'long' | 'short')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
          {errors.direction && (
            <p className="text-sm text-destructive">{errors.direction.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Session</Label>
          <Select
            value={session}
            onValueChange={(value) => setValue('session', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="london">London</SelectItem>
              <SelectItem value="newyork">New York</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.session && (
            <p className="text-sm text-destructive">{errors.session.message}</p>
          )}
        </div>
      </div>

      {/* Entry, Exit, Lot Size */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entry_price">Entry Price</Label>
          <Input
            id="entry_price"
            type="number"
            step="0.00001"
            placeholder="1.08550"
            {...register('entry_price')}
          />
          {errors.entry_price && (
            <p className="text-sm text-destructive">{errors.entry_price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exit_price">Exit Price</Label>
          <Input
            id="exit_price"
            type="number"
            step="0.00001"
            placeholder="1.08650"
            {...register('exit_price')}
          />
          {errors.exit_price && (
            <p className="text-sm text-destructive">{errors.exit_price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lot_size">Lot Size</Label>
          <Input
            id="lot_size"
            type="number"
            step="0.01"
            placeholder="1.00"
            {...register('lot_size')}
          />
          {errors.lot_size && (
            <p className="text-sm text-destructive">{errors.lot_size.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="user_notes">Notes (Optional)</Label>
        <Textarea
          id="user_notes"
          placeholder="Add any notes about this trade..."
          rows={3}
          {...register('user_notes')}
        />
      </div>

      {/* ✅ Prop Firm Selector - only shows if user has active challenges */}
      {propFirms.length > 0 && (
        <div className="space-y-2">
          <Label>Link to Prop Firm (Optional)</Label>
          <Select
            value={selectedPropFirm}
            onValueChange={(value) => {
              setSelectedPropFirm(value)
              setValue('prop_firm_id', value === 'none' ? '' : value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select prop firm challenge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No prop firm</SelectItem>
              {propFirms.map((firm) => (
                <SelectItem key={firm.id} value={firm.id}>
                  {firm.firm_name} — {firm.challenge_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : trade ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </form>
  )
}