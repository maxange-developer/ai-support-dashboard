'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyCost } from '@/lib/db/analytics'

interface ChartPoint {
  day: string
  cost: number
}

export default function CostChart({ data }: { data: DailyCost[] }) {
  if (data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center glass border border-white/10">
        <p className="text-sm text-white/30">No data for the last 7 days</p>
      </div>
    )
  }

  const chartData: ChartPoint[] = data.map((d) => ({
    day: new Date(d.day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
    cost: d.costCents / 100,
  }))

  return (
    <div className="h-60 w-full glass border border-white/10 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            stroke="rgba(255,255,255,0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10,10,15,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
            itemStyle={{ color: '#22d3ee' }}
            formatter={(value) => {
              const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : 0
              return [`$${n.toFixed(3)}`, 'Cost']
            }}
            cursor={{ stroke: 'rgba(34,211,238,0.2)', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0e7490', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
