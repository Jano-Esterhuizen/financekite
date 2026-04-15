'use client'

import { useEffect, useState } from 'react'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { businessesApi } from '@/lib/api/businesses'
import { invoicesApi } from '@/lib/api/invoices'
import { expensesApi } from '@/lib/api/expenses'
import { recurringPaymentsApi } from '@/lib/api/recurring-payments'
import type { FinancialSummary, Invoice, Expense, RecurringPayment } from '@/lib/types'
import MetricCard from '@/components/dashboard/MetricCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import ExpensesDonut from '@/components/dashboard/ExpensesDonut'
import OverdueInvoices from '@/components/dashboard/OverdueInvoices'
import UpcomingPayments from '@/components/dashboard/UpcomingPayments'

function MetricSkeleton() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border animate-pulse">
      <div className="h-4 w-24 bg-muted rounded mb-4" />
      <div className="h-7 w-32 bg-muted rounded mb-2" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border animate-pulse">
      <div className="h-4 w-36 bg-muted rounded mb-6" />
      <div className="h-[250px] bg-muted rounded" />
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border animate-pulse space-y-3">
      <div className="h-4 w-32 bg-muted rounded mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-muted rounded" />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { selectedBusiness } = useBusiness()

  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([])
  const [loadedForId, setLoadedForId] = useState<string | null>(null)

  const loading = !!selectedBusiness && loadedForId !== selectedBusiness.id

  useEffect(() => {
    if (!selectedBusiness) return

    const id = selectedBusiness.id
    let cancelled = false

    Promise.all([
      businessesApi.getFinancialSummary(id),
      invoicesApi.getAll(id),
      expensesApi.getAll(id),
      recurringPaymentsApi.getAll(id),
    ])
      .then(([summaryData, invoiceData, expenseData, recurringData]) => {
        if (cancelled) return
        setSummary(summaryData)
        setInvoices(invoiceData)
        setExpenses(expenseData)
        setRecurringPayments(recurringData)
        setLoadedForId(id)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setLoadedForId(id)
      })

    return () => { cancelled = true }
  }, [selectedBusiness])

  const currency = selectedBusiness?.currencyCode ?? 'ZAR'

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)

  // Build sparkline from last 6 months of paid invoice totals
  const revenueSparkline = (() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return invoices
        .filter((inv) => {
          if (inv.status !== 'Paid') return false
          const date = new Date(inv.issuedDate)
          return date.getFullYear() === d.getFullYear() && date.getMonth() === d.getMonth()
        })
        .reduce((s, inv) => s + inv.amount, 0)
    })
  })()

  const metricCards = summary
    ? [
        {
          title: 'Total Revenue',
          value: fmt(summary.totalPaid),
          subtitle: 'Paid invoices',
          subtitleColor: 'muted' as const,
          sparklineData: revenueSparkline,
        },
        {
          title: 'Outstanding',
          value: fmt(summary.totalOutstanding),
          subtitle: 'Pending & overdue',
          subtitleColor: 'muted' as const,
        },
        {
          title: 'Total Expenses',
          value: fmt(summary.totalExpenses),
          subtitle: 'All logged expenses',
          subtitleColor: 'muted' as const,
        },
        {
          title: 'Net Profit',
          value: fmt(summary.futureProfit),
          subtitle: summary.futureProfit >= 0 ? 'On track' : 'Expenses exceed revenue',
          subtitleColor: summary.futureProfit >= 0 ? ('success' as const) : ('destructive' as const),
        },
      ]
    : []

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">
            {selectedBusiness?.name ?? 'Dashboard'}
          </span>
          {' / '}
          <span>Overview</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading || !summary
            ? [1, 2, 3, 4].map((i) => <MetricSkeleton key={i} />)
            : metricCards.map((card) => <MetricCard key={card.title} {...card} />)}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? <ChartSkeleton /> : <RevenueChart invoices={invoices} expenses={expenses} />}
          </div>
          <div>
            {loading ? <PanelSkeleton /> : <OverdueInvoices invoices={invoices} currencyCode={currency} />}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <PanelSkeleton />
              <PanelSkeleton />
            </>
          ) : (
            <>
              <ExpensesDonut expenses={expenses} currencyCode={currency} />
              <UpcomingPayments recurringPayments={recurringPayments} currencyCode={currency} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
