/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnalyzeButtonProps {
  tradeId: string
  hasImage: boolean
  hasAnalysis: boolean
}

export function AnalyzeButton({ tradeId, hasImage, hasAnalysis }: AnalyzeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!hasImage) {
      setError('Upload a screenshot first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/trades/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant={hasAnalysis ? 'outline' : 'default'}
        size="sm"
        onClick={handleAnalyze}
        disabled={loading || !hasImage}
        title={!hasImage ? 'Upload a screenshot first' : ''}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Analyzing...' : hasAnalysis ? 'Re-analyze' : 'AI Analyze'}
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}