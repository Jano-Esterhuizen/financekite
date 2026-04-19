import { MoreVertical, RefreshCw, FileClock, Calendar } from 'lucide-react'
import type { RecurringPayment, RecurringInvoice } from '@/lib/types'

interface Props {
  recurringPayments: RecurringPayment[]
  recurringInvoices: RecurringInvoice[]
  currencyCode?: string
}

type UpcomingItem = {
  id: string
  description: string
  amount: number
  billingCycle: 'Weekly' | 'Monthly' | 'Yearly'
  daysUntilNextDue: number
  type: 'payment' | 'invoice'
}

export default function UpcomingPayments({ recurringPayments, recurringInvoices, currencyCode = 'ZAR' }: Props) {
  const items: UpcomingItem[] = [
    ...recurringPayments.filter(p => p.isActive).map(p => ({ ...p, type: 'payment' as const })),
    ...recurringInvoices.filter(i => i.isActive).map(i => ({ ...i, type: 'invoice' as const })),
  ]
    .sort((a, b) => a.daysUntilNextDue - b.daysUntilNextDue)
    .slice(0, 5)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(n)

  const cycleLabel = (cycle: string) => {
    if (cycle === 'Weekly') return 'Weekly'
    if (cycle === 'Monthly') return 'Monthly'
    return 'Yearly'
  }

  const dueLabel = (days: number) => {
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days}d`
  }

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Upcoming Recurring</h3>
        <MoreVertical size={18} className="text-muted-foreground" />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
          <Calendar size={28} />
          <p className="text-sm">No upcoming recurring items</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const isInvoice = item.type === 'invoice'
            return (
              <li key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isInvoice ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                  {isInvoice
                    ? <FileClock size={15} className="text-emerald-600" />
                    : <RefreshCw size={15} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {cycleLabel(item.billingCycle)} · {isInvoice ? 'Invoice' : 'Payment'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-medium ${isInvoice ? 'text-emerald-600' : 'text-foreground'}`}>
                    {isInvoice ? '+' : '-'}{fmt(item.amount)}
                  </p>
                  <p className={`text-xs ${item.daysUntilNextDue <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {dueLabel(item.daysUntilNextDue)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
