'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { MoreHorizontal } from 'lucide-react'
import type { Invoice, Expense } from '@/lib/types'

interface ChartPoint {
  month: string
  revenue: number
  expenses: number
}

function buildChartData(invoices: Invoice[], expenses: Expense[]): ChartPoint[] {
  const points: ChartPoint[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const label = d.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' })

    const revenue = invoices
      .filter((inv) => {
        if (inv.status !== 'Paid') return false
        const date = new Date(inv.issuedDate)
        return date.getFullYear() === year && date.getMonth() === month
      })
      .reduce((sum, inv) => sum + inv.amount, 0)

    const expenseTotal = expenses
      .filter((exp) => {
        const date = new Date(exp.date)
        return date.getFullYear() === year && date.getMonth() === month
      })
      .reduce((sum, exp) => sum + exp.amount, 0)

    points.push({ month: label, revenue, expenses: expenseTotal })
  }

  return points
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.dataKey}</span>
          <span className="ml-auto font-medium text-foreground">
            R{entry.value.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  )
}

interface Props {
  invoices: Invoice[]
  expenses: Expense[]
}

export default function RevenueChart({ invoices, expenses }: Props) {
  const data = buildChartData(invoices, expenses)

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-foreground">Revenue vs Expenses</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" /> Revenue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(190,52%,60%)' }} /> Expenses
            </span>
          </div>
        </div>
        <MoreHorizontal size={18} className="text-muted-foreground" />
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(190,52%,36%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(190,52%,36%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(190,52%,36%)"
            strokeWidth={2}
            fill="url(#gradRevenue)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="hsl(190,52%,60%)"
            strokeWidth={2}
            fill="transparent"
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
