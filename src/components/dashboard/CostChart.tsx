'use client'

import {
  BarChart,
  Bar,
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
      <div className="h-44 flex items-center justify-center glass border border-white/10">
        <p className="text-sm text-white/30">No data for the last 7 days</p>
      </div>
    )
  }

  const chartData: ChartPoint[] = data.map((d) => ({
    day: new Date(d.day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
    cost: d.costCents / 100,
  }))

  return (
    <div className="h-44 glass border border-white/10 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(3)}`}
            width={56}
          />
          <Tooltip
            formatter={(value) => {
              const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : 0
              return [`$${n.toFixed(4)}`, 'Cost']
            }}
            contentStyle={{
              fontSize: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
            }}
            cursor={{ fill: 'rgba(37,99,235,0.06)' }}
          />
          <Bar dataKey="cost" fill="#2563eb" fillOpacity={0.8} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
