'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from './chart-card'
import type { PnLDataPoint } from '@/lib/analytics'

interface PnLChartProps {
  data: PnLDataPoint[]
}

export function PnLChart({ data }: PnLChartProps) {
  if (data.length === 0) {
    return (
      <ChartCard title="P&L Over Time" description="Cumulative profit/loss">
        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
          No trade data yet
        </div>
      </ChartCard>
    )
  }

  const isPositive = data[data.length - 1]?.cumulative >= 0

  return (
    <ChartCard title="P&L Over Time" description="Cumulative profit/loss">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? '#22c55e' : '#ef4444'}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? '#22c55e' : '#ef4444'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${v}`}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value: number | undefined) => value !== undefined ? [`$${value.toFixed(2)}`, 'Cumulative P&L'] : ['N/A', 'Cumulative P&L']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
            fill="url(#pnlGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}