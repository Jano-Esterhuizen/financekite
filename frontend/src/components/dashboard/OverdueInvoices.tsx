import { MoreVertical, CheckCircle } from 'lucide-react'
import type { Invoice } from '@/lib/types'

interface Props {
  invoices: Invoice[]
  currencyCode?: string
}

export default function OverdueInvoices({ invoices, currencyCode = 'ZAR' }: Props) {
  const overdue = invoices
    .filter((inv) => inv.status === 'Overdue')
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(n)

  const total = overdue.reduce((s, inv) => s + inv.amount, 0)

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Overdue Invoices</h3>
        <MoreVertical size={18} className="text-muted-foreground" />
      </div>

      {overdue.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2 text-success">
          <CheckCircle size={28} />
          <p className="text-sm font-medium">No overdue invoices</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border flex-1">
            {overdue.map((inv) => (
              <li key={inv.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inv.clientName}</p>
                  <p className="text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-foreground">{fmt(inv.amount)}</p>
                  <p className="text-xs text-destructive">{inv.daysOverdue}d overdue</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{overdue.length} overdue invoice{overdue.length !== 1 ? 's' : ''}</span>
            <span className="text-sm font-semibold text-destructive">{fmt(total)}</span>
          </div>
        </>
      )}
    </div>
  )
}
