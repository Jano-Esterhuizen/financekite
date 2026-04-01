'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { MoreVertical } from 'lucide-react'
import type { Expense } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  Hosting: 'hsl(190,52%,36%)',
  Domain: 'hsl(190,52%,55%)',
  Tools: 'hsl(160,60%,45%)',
  Service: 'hsl(215,60%,55%)',
  Other: 'hsl(220,13%,75%)',
}

interface Segment {
  name: string
  value: number
  color: string
}

function buildSegments(expenses: Expense[]): Segment[] {
  const totals: Record<string, number> = {}
  for (const exp of expenses) {
    totals[exp.category] = (totals[exp.category] ?? 0) + exp.amount
  }
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] ?? 'hsl(220,13%,75%)' }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
}

interface Props {
  expenses: Expense[]
  currencyCode?: string
}

export default function ExpensesDonut({ expenses, currencyCode = 'ZAR' }: Props) {
  const segments = buildSegments(expenses)
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(n)

  const isEmpty = segments.length === 0

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Expense Breakdown</h3>
        <MoreVertical size={18} className="text-muted-foreground" />
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          No expenses recorded yet
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                >
                  {segments.map((seg, i) => (
                    <Cell key={i} fill={seg.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
              <span className="text-base font-bold text-foreground leading-tight">{fmt(total)}</span>
              <span className="text-[10px] text-muted-foreground">Total</span>
            </div>
          </div>

          {/* Legend */}
          <ul className="space-y-2 text-sm flex-1">
            {segments.map((seg) => (
              <li key={seg.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-foreground">{seg.name}</span>
                </span>
                <span className="text-muted-foreground font-medium text-xs">{fmt(seg.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
