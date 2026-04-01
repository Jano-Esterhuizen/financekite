'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { Invoice, Expense } from '@/lib/types'

type ViewMode = 'lifetime' | '6months'

interface ChartPoint {
  month: string
  revenue: number
  expenses: number
}

function buildLifetimeData(invoices: Invoice[], expenses: Expense[]): ChartPoint[] {
  const allDates = [
    ...invoices.filter((inv) => inv.status === 'Paid').map((inv) => new Date(inv.issuedDate)),
    ...expenses.map((exp) => new Date(exp.date)),
  ]

  if (allDates.length === 0) return []

  const earliest = allDates.reduce((min, d) => (d < min ? d : min))
  const now = new Date()

  const start = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 1)

  const points: ChartPoint[] = []
  let cumulativeRevenue = 0
  let cumulativeExpenses = 0
  const cursor = new Date(start)

  while (cursor <= end) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const label = cursor.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' })

    cumulativeRevenue += invoices
      .filter((inv) => {
        if (inv.status !== 'Paid') return false
        const d = new Date(inv.issuedDate)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, inv) => sum + inv.amount, 0)

    cumulativeExpenses += expenses
      .filter((exp) => {
        const d = new Date(exp.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, exp) => sum + exp.amount, 0)

    points.push({ month: label, revenue: cumulativeRevenue, expenses: cumulativeExpenses })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return points
}

function build6MonthData(invoices: Invoice[], expenses: Expense[]): ChartPoint[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
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

    return { month: label, revenue, expenses: expenseTotal }
  })
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
  const [view, setView] = useState<ViewMode>('6months')

  const data = view === 'lifetime'
    ? buildLifetimeData(invoices, expenses)
    : build6MonthData(invoices, expenses)

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

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 text-xs">
          <button
            onClick={() => setView('6months')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              view === '6months'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setView('lifetime')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              view === 'lifetime'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lifetime
          </button>
        </div>
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
            interval="preserveStartEnd"
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
