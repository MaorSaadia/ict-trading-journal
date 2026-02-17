'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Lightbulb, Brain, TrendingUp } from 'lucide-react'
import type { AIAnalysis } from '@/lib/types'

interface AIAnalysisDisplayProps {
  analysis: AIAnalysis
}

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  return (
    <div className="space-y-4">

      {/* Entry Quality Banner */}
      <div className={`p-4 rounded-lg border-2 flex items-center justify-between
        ${analysis.entryQuality === 'High Probability'
          ? 'bg-green-500/10 border-green-500/50'
          : analysis.entryQuality === 'Aggressive'
          ? 'bg-yellow-500/10 border-yellow-500/50'
          : 'bg-red-500/10 border-red-500/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <TrendingUp className={`h-5 w-5
            ${analysis.entryQuality === 'High Probability' ? 'text-green-500' : ''}
            ${analysis.entryQuality === 'Aggressive' ? 'text-yellow-500' : ''}
            ${analysis.entryQuality === 'Poor' ? 'text-red-500' : ''}
          `} />
          <div>
            <p className="text-xs text-muted-foreground">Entry Quality</p>
            <p className={`font-bold text-lg
              ${analysis.entryQuality === 'High Probability' ? 'text-green-600 dark:text-green-400' : ''}
              ${analysis.entryQuality === 'Aggressive' ? 'text-yellow-600 dark:text-yellow-400' : ''}
              ${analysis.entryQuality === 'Poor' ? 'text-red-600 dark:text-red-400' : ''}
            `}>
              {analysis.entryQuality}
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1">
            {analysis.mssIdentified
              ? <CheckCircle className="h-4 w-4 text-green-500" />
              : <XCircle className="h-4 w-4 text-muted-foreground" />
            }
            <span className="text-muted-foreground">MSS</span>
          </div>
          <div className="flex items-center gap-1">
            {analysis.fvgIdentified
              ? <CheckCircle className="h-4 w-4 text-green-500" />
              : <XCircle className="h-4 w-4 text-muted-foreground" />
            }
            <span className="text-muted-foreground">FVG</span>
          </div>
        </div>
      </div>

      {/* ICT Concepts */}
      {analysis.ictConcepts && analysis.ictConcepts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              ICT Concepts Identified
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.ictConcepts.map((concept) => (
              <Badge key={concept} variant="secondary">
                {concept}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      <div className="bg-muted/50 p-3 rounded-lg">
        <p className="text-sm text-muted-foreground">{analysis.reasoning}</p>
      </div>

      {/* What Did Well */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
            What You Did Well
          </h4>
        </div>
        <ul className="space-y-1">
          {analysis.feedback.whatDidWell.map((point, i) => (
            <li key={i} className="text-sm text-green-700 dark:text-green-300 flex gap-2">
              <span className="mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What To Improve */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">
            What To Improve
          </h4>
        </div>
        <ul className="space-y-1">
          {analysis.feedback.whatToImprove.map((point, i) => (
            <li key={i} className="text-sm text-red-700 dark:text-red-300 flex gap-2">
              <span className="mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Suggestion */}
      <div className="bg-blue-500/10 border border-l-4 border-blue-500/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Key Suggestion
          </h4>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {analysis.feedback.keySuggestion}
        </p>
      </div>

    </div>
  )
}