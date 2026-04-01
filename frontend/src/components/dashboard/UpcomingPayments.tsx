import { MoreVertical, RefreshCw, Calendar } from 'lucide-react'
import type { RecurringPayment } from '@/lib/types'

interface Props {
  recurringPayments: RecurringPayment[]
  currencyCode?: string
}

export default function UpcomingPayments({ recurringPayments, currencyCode = 'ZAR' }: Props) {
  const upcoming = recurringPayments
    .filter((p) => p.isActive)
    .sort((a, b) => a.daysUntilNextDue - b.daysUntilNextDue)
    .slice(0, 5)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(n)

  const cycleLabel = (cycle: RecurringPayment['billingCycle']) => {
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
        <h3 className="font-semibold text-foreground">Upcoming Payments</h3>
        <MoreVertical size={18} className="text-muted-foreground" />
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
          <Calendar size={28} />
          <p className="text-sm">No upcoming recurring payments</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((payment) => (
            <li key={payment.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{payment.description}</p>
                <p className="text-xs text-muted-foreground">{cycleLabel(payment.billingCycle)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-foreground">{fmt(payment.amount)}</p>
                <p className={`text-xs ${payment.daysUntilNextDue <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {dueLabel(payment.daysUntilNextDue)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
