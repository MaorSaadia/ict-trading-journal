/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartCard } from './chart-card'
import type { ConceptStat } from '@/lib/analytics'

interface ConceptChartProps {
  data: ConceptStat[]
}

// ✅ Custom tooltip with full concept name + all stats
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-3 text-sm min-w-[160px]">
        <p className="font-semibold mb-2">{item.concept}</p>
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Win Rate: <span className={`font-medium ${item.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>{item.winRate}%</span>
          </p>
          <p className="text-muted-foreground">
            Trades: <span className="text-foreground font-medium">{item.trades}</span>
          </p>
          <p className="text-muted-foreground">
            Wins: <span className="text-green-500 font-medium">{item.wins}</span>
          </p>
          <p className="text-muted-foreground">
            P&L: <span className={`font-medium ${item.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>${item.pnl}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

// ✅ Custom X-axis tick with proper wrapping
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const label: string = payload.value
  // Split on space or slash to wrap long names
  const words = label.split(/[\s/]/)
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
  const line2 = words.slice(Math.ceil(words.length / 2)).join(' ')

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="currentColor" fontSize={11} className="fill-muted-foreground">
        {line1}
      </text>
      {line2 && (
        <text x={0} y={0} dy={24} textAnchor="middle" fill="currentColor" fontSize={11} className="fill-muted-foreground">
          {line2}
        </text>
      )}
    </g>
  )
}

export function ConceptChart({ data }: ConceptChartProps) {
  if (data.length === 0) {
    return (
      <ChartCard title="ICT Concepts Performance" description="Win rate by ICT concept used">
        <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
          Run AI analysis on trades to see concept stats
        </div>
      </ChartCard>
    )
  }

  // ✅ Limit to top 8 concepts, keep full name for tooltip
  const formattedData = data.slice(0, 8)

  // ✅ Dynamic bar size based on number of concepts
  const barSize = Math.min(48, Math.max(24, Math.floor(300 / formattedData.length)))

  return (
    <ChartCard title="ICT Concepts Performance" description="Win rate by ICT concept used">
      {/* ✅ Taller container + bigger bottom margin for labels */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 20, left: 10, bottom: 55 }}
          barSize={barSize}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis
            dataKey="concept"
            tick={<CustomXAxisTick />}
            interval={0}
            tickLine={false}
            height={50}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
          />
          <Bar dataKey="winRate" radius={[6, 6, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.winRate >= 50 ? '#3b82f6' : '#8b5cf6'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Legend below chart */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-85" />
          <span>≥ 50% win rate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-purple-500 opacity-85" />
          <span>&lt; 50% win rate</span>
        </div>
      </div>
    </ChartCard>
  )
}