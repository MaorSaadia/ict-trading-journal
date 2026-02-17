/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartCard } from './chart-card'
import type { EntryQualityStat } from '@/lib/analytics'

interface EntryQualityChartProps {
  data: EntryQualityStat[]
}

const COLORS = {
  'High Probability': '#22c55e',
  'Aggressive': '#f59e0b',
  'Poor': '#ef4444',
}

// ✅ Custom tooltip that doesn't overlap the chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-3 text-sm">
        <p className="font-semibold mb-1">{item.quality}</p>
        <p className="text-muted-foreground">Trades: <span className="text-foreground font-medium">{item.trades}</span></p>
        <p className="text-muted-foreground">Win Rate: <span className="text-foreground font-medium">{item.winRate}%</span></p>
        <p className="text-muted-foreground">P&L: <span className={`font-medium ${item.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>${item.pnl}</span></p>
      </div>
    )
  }
  return null
}

// ✅ Custom legend below the chart
const CustomLegend = ({ data }: { data: EntryQualityStat[] }) => (
  <div className="flex flex-wrap justify-center gap-4 mt-2">
    {data.map((entry) => (
      <div key={entry.quality} className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: COLORS[entry.quality as keyof typeof COLORS] || '#6b7280' }}
        />
        <span className="text-xs text-muted-foreground">
          {entry.quality}
          <span className="ml-1 font-medium text-foreground">({entry.trades})</span>
        </span>
      </div>
    ))}
  </div>
)

// ✅ Custom label that shows percentage outside the slice
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  if (percent < 0.08) return null // Hide label if slice is too small

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function EntryQualityChart({ data }: EntryQualityChartProps) {
  if (data.length === 0) {
    return (
      <ChartCard title="Entry Quality Breakdown" description="Distribution of entry types">
        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
          Run AI analysis on trades first
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Entry Quality Breakdown" description="Distribution of entry types">
      <div className="flex flex-col">
        {/* ✅ Pie chart with no default labels (we use custom ones) */}
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="trades"
              nameKey="quality"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={45}
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[entry.quality as keyof typeof COLORS] || '#6b7280'}
                  stroke="transparent"
                />
              ))}
            </Pie>
            {/* ✅ Custom tooltip - positioned away from chart */}
            <Tooltip
              content={<CustomTooltip />}
              position={{ x: 0, y: 0 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* ✅ Legend below chart - no overlap */}
        <CustomLegend data={data} />

        {/* ✅ Stats row below legend */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
          {data.map((entry) => (
            <div key={entry.quality} className="text-center">
              <div
                className="text-xs font-medium mb-1 truncate"
                style={{ color: COLORS[entry.quality as keyof typeof COLORS] || '#6b7280' }}
              >
                {entry.quality}
              </div>
              <div className="text-lg font-bold">{entry.winRate}%</div>
              <div className="text-xs text-muted-foreground">win rate</div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}