/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

const PROP_FIRMS = [
  'FTMO',
  'MyFundedFX',
  'Apex Trader Funding',
  'TopstepX',
  'Take Profit Trader',
  'E8 Funding',
  'Earn2Trade',
  'Leeloo Trading',
  'The5ers',
  'FundedNext',
  'Other',
]

const CHALLENGE_TYPES = [
  'Phase 1',
  'Phase 2',
  'Funded Account',
  'Express Challenge',
  'Evaluation',
]

const ACCOUNT_SIZES = [
  '10000',
  '25000',
  '50000',
  '100000',
  '150000',
  '200000',
]

const formSchema = z.object({
  firm_name: z.string().min(1, 'Firm name is required'),
  challenge_type: z.string().min(1, 'Challenge type is required'),
  account_size: z.string().min(1, 'Account size is required'),
  profit_target: z.string().min(1, 'Profit target is required'),
  daily_loss_limit: z.string().min(1, 'Daily loss limit is required'),
  max_loss_limit: z.string().min(1, 'Max loss limit is required'),
  start_date: z.string().min(1, 'Start date is required'),
})

type FormData = z.infer<typeof formSchema>

interface PropFirmFormProps {
  onSuccess: () => void
}

export function PropFirmForm({ onSuccess }: PropFirmFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firmName, setFirmName] = useState('')
  const [challengeType, setChallengeType] = useState('')
  const [accountSize, setAccountSize] = useState('')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
    },
  })

  // Auto-calculate suggested values when account size changes
  const handleAccountSizeChange = (value: string) => {
    setAccountSize(value)
    setValue('account_size', value)
    const size = parseFloat(value)
    // Common prop firm rules
    setValue('profit_target', (size * 0.08).toString())   // 8% profit target
    setValue('daily_loss_limit', (size * 0.05).toString()) // 5% daily loss
    setValue('max_loss_limit', (size * 0.10).toString())   // 10% max loss
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const accountSize = parseFloat(data.account_size)

      const { error } = await supabase
        .from('prop_firm_challenges')
        .insert({
          user_id: user.id,
          firm_name: data.firm_name,
          challenge_type: data.challenge_type,
          account_size: accountSize,
          current_balance: accountSize, // Start at account size
          profit_target: parseFloat(data.profit_target),
          daily_loss_limit: parseFloat(data.daily_loss_limit),
          max_loss_limit: parseFloat(data.max_loss_limit),
          start_date: data.start_date,
          status: 'active',
        })

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Firm Name */}
      <div className="space-y-2">
        <Label>Prop Firm</Label>
        <Select
          value={firmName}
          onValueChange={(value) => {
            setFirmName(value)
            setValue('firm_name', value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select prop firm" />
          </SelectTrigger>
          <SelectContent>
            {PROP_FIRMS.map((firm) => (
              <SelectItem key={firm} value={firm}>{firm}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.firm_name && (
          <p className="text-sm text-destructive">{errors.firm_name.message}</p>
        )}
      </div>

      {/* Challenge Type */}
      <div className="space-y-2">
        <Label>Challenge Type</Label>
        <Select
          value={challengeType}
          onValueChange={(value) => {
            setChallengeType(value)
            setValue('challenge_type', value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select challenge type" />
          </SelectTrigger>
          <SelectContent>
            {CHALLENGE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.challenge_type && (
          <p className="text-sm text-destructive">{errors.challenge_type.message}</p>
        )}
      </div>

      {/* Account Size */}
      <div className="space-y-2">
        <Label>Account Size</Label>
        <Select
          value={accountSize}
          onValueChange={handleAccountSizeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account size" />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                ${parseInt(size).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.account_size && (
          <p className="text-sm text-destructive">{errors.account_size.message}</p>
        )}
      </div>

      {/* Rules - auto filled but editable */}
      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <p className="text-sm font-medium">Challenge Rules</p>
        <p className="text-xs text-muted-foreground">
          Auto-filled with common rules. Adjust to match your specific challenge.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="profit_target" className="text-xs">
              Profit Target ($)
            </Label>
            <Input
              id="profit_target"
              type="number"
              placeholder="800"
              {...register('profit_target')}
            />
            {errors.profit_target && (
              <p className="text-xs text-destructive">{errors.profit_target.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily_loss_limit" className="text-xs">
              Daily Loss Limit ($)
            </Label>
            <Input
              id="daily_loss_limit"
              type="number"
              placeholder="500"
              {...register('daily_loss_limit')}
            />
            {errors.daily_loss_limit && (
              <p className="text-xs text-destructive">{errors.daily_loss_limit.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_loss_limit" className="text-xs">
              Max Loss Limit ($)
            </Label>
            <Input
              id="max_loss_limit"
              type="number"
              placeholder="1000"
              {...register('max_loss_limit')}
            />
            {errors.max_loss_limit && (
              <p className="text-xs text-destructive">{errors.max_loss_limit.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          type="date"
          {...register('start_date')}
        />
        {errors.start_date && (
          <p className="text-sm text-destructive">{errors.start_date.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Challenge'}
      </Button>
    </form>
  )
}