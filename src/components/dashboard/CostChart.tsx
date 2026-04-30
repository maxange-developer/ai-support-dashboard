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
      <div className="h-44 flex items-center justify-center rounded-md border bg-muted/30">
        <p className="text-sm text-muted-foreground">Nessun dato negli ultimi 7 giorni</p>
      </div>
    )
  }

  const chartData: ChartPoint[] = data.map((d) => ({
    day: new Date(d.day).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
    cost: d.costCents / 100,
  }))

  return (
    <div className="h-44 rounded-md border bg-card p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(3)}`}
            width={56}
          />
          <Tooltip
            formatter={(value) => {
              const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : 0
              return [`$${n.toFixed(4)}`, 'Costo']
            }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
            }}
            cursor={{ fill: 'hsl(var(--muted))' }}
          />
          <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
