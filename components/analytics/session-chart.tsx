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
import type { SessionStat } from '@/lib/analytics'

interface SessionChartProps {
  data: SessionStat[]
}

// ✅ Custom tooltip with full stats
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-3 text-sm min-w-[150px]">
        <p className="font-semibold mb-2">{item.session}</p>
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Win Rate:{' '}
            <span className={`font-medium ${item.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
              {item.winRate}%
            </span>
          </p>
          <p className="text-muted-foreground">
            Trades: <span className="text-foreground font-medium">{item.trades}</span>
          </p>
          <p className="text-muted-foreground">
            Wins: <span className="text-green-500 font-medium">{item.wins}</span>
          </p>
          <p className="text-muted-foreground">
            P&L:{' '}
            <span className={`font-medium ${item.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.pnl >= 0 ? '+' : ''}${item.pnl}
            </span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function SessionChart({ data }: SessionChartProps) {
  if (data.length === 0) {
    return (
      <ChartCard title="Performance by Session" description="Win rate per trading session">
        <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
          No session data yet
        </div>
      </ChartCard>
    )
  }

  // ✅ Fixed bar size regardless of how many sessions
  const barSize = 52

  return (
    <ChartCard title="Performance by Session" description="Win rate per trading session">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          barSize={barSize}
          barCategoryGap="40%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis
            dataKey="session"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
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
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.winRate >= 50 ? '#22c55e' : '#ef4444'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Stats row below chart */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 pt-4 border-t">
        {data.map((session) => (
          <div key={session.session} className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{session.session}</p>
            <p className={`text-lg font-bold ${
              session.winRate >= 50
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {session.winRate}%
            </p>
            <p className="text-xs text-muted-foreground">{session.trades} trades</p>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}