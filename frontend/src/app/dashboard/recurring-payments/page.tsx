'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { recurringPaymentsApi } from '@/lib/api/recurring-payments'
import { clientsApi } from '@/lib/api/clients'
import type { RecurringPayment, Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// ── constants ─────────────────────────────────────────────────────────────────

const BILLING_CYCLES = ['Weekly', 'Monthly', 'Yearly'] as const
type BillingCycle = typeof BILLING_CYCLES[number]

const CYCLE_STYLES: Record<BillingCycle, string> = {
  Weekly:  'bg-blue-500/10 text-blue-600 border-0',
  Monthly: 'bg-primary/10 text-primary border-0',
  Yearly:  'bg-purple-500/10 text-purple-600 border-0',
}

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function monthlyEquivalent(amount: number, cycle: BillingCycle): number {
  if (cycle === 'Weekly')  return amount * 52 / 12
  if (cycle === 'Yearly')  return amount / 12
  return amount
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// ── form dialog ───────────────────────────────────────────────────────────────

interface FormData {
  description: string
  amount: string
  billingCycle: BillingCycle
  startDate: string
  nextDueDate: string
  isActive: boolean
  clientId: string
  notes: string
}

interface FormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  initial?: RecurringPayment | null
  clients: Client[]
  saving: boolean
}

function RecurringPaymentFormDialog({ open, onClose, onSave, initial, clients, saving }: FormDialogProps) {
  const blank: FormData = {
    description: '',
    amount: '',
    billingCycle: 'Monthly',
    startDate: todayIso(),
    nextDueDate: todayIso(),
    isActive: true,
    clientId: '',
    notes: '',
  }

  const [form, setForm] = useState<FormData>(() =>
    initial
      ? {
          description: initial.description,
          amount: String(initial.amount),
          billingCycle: initial.billingCycle,
          startDate: initial.startDate.slice(0, 10),
          nextDueDate: initial.nextDueDate.slice(0, 10),
          isActive: initial.isActive,
          clientId: initial.clientId ?? '',
          notes: initial.notes ?? '',
        }
      : blank
  )

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const valid =
    form.description.trim() &&
    Number(form.amount) > 0 &&
    form.startDate &&
    form.nextDueDate &&
    new Date(form.nextDueDate) >= new Date(form.startDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    await onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Recurring Payment' : 'Add Recurring Payment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-desc">Description <span className="text-destructive">*</span></Label>
            <Input
              id="rp-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="e.g. Monthly office rent"
              required
            />
          </div>

          {/* Amount + Billing Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rp-amount">Amount <span className="text-destructive">*</span></Label>
              <Input
                id="rp-amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Billing Cycle <span className="text-destructive">*</span></Label>
              <Select value={form.billingCycle} onValueChange={(v) => set('billingCycle', v as BillingCycle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date + Next Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rp-start">Start Date <span className="text-destructive">*</span></Label>
              <Input
                id="rp-start"
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rp-due">Next Due Date <span className="text-destructive">*</span></Label>
              <Input
                id="rp-due"
                type="date"
                value={form.nextDueDate}
                min={form.startDate}
                onChange={(e) => set('nextDueDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Client (optional) */}
          <div className="space-y-1.5">
            <Label>Client <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Select value={form.clientId || '_none'} onValueChange={(v) => set('clientId', v === '_none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="No client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No client</SelectItem>
                {clients.filter((c) => !c.isArchived).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}{c.companyName ? ` — ${c.companyName}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active toggle (edit only) */}
          {initial && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.isActive ? 'active' : 'inactive'}
                onValueChange={(v) => set('isActive', v === 'active')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="rp-notes">Notes</Label>
            <textarea
              id="rp-notes"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Optional notes…"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !valid}>
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function RecurringPaymentsPage() {
  const { selectedBusiness } = useBusiness()
  const currency = selectedBusiness?.currencyCode ?? 'ZAR'

  const [payments, setPayments] = useState<RecurringPayment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [cycleFilter, setCycleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RecurringPayment | null>(null)
  const [saving, setSaving] = useState(false)

  // ── fetch ──
  useEffect(() => {
    if (!selectedBusiness) return
    setLoading(true)
    Promise.all([
      recurringPaymentsApi.getAll(selectedBusiness.id),
      clientsApi.getAll(selectedBusiness.id),
    ])
      .then(([rpData, clientData]) => {
        setPayments(rpData)
        setClients(clientData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedBusiness])

  // ── derived ──
  const active = payments.filter((p) => p.isActive)

  const monthlyTotal = active.reduce(
    (sum, p) => sum + monthlyEquivalent(p.amount, p.billingCycle),
    0,
  )

  const dueSoon = active.filter((p) => p.daysUntilNextDue <= 7).length

  const summaryCards = [
    { label: 'Active Payments', value: String(active.length), sub: `${payments.length} total` },
    { label: 'Monthly Commitment', value: fmt(monthlyTotal, currency), sub: 'Across active payments' },
    { label: 'Yearly Commitment', value: fmt(monthlyTotal * 12, currency), sub: 'Projected annual spend' },
    {
      label: 'Due Within 7 Days',
      value: String(dueSoon),
      sub: dueSoon > 0 ? 'Payments coming up' : 'Nothing due soon',
      highlight: dueSoon > 0,
    },
  ]

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch =
      p.description.toLowerCase().includes(q) ||
      (p.clientName ?? '').toLowerCase().includes(q)
    const matchCycle = cycleFilter === 'All' || p.billingCycle === cycleFilter
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && p.isActive) ||
      (statusFilter === 'Inactive' && !p.isActive)
    return matchSearch && matchCycle && matchStatus
  })

  // ── actions ──
  const openAdd = () => { setEditTarget(null); setDialogOpen(true) }
  const openEdit = (p: RecurringPayment) => { setEditTarget(p); setDialogOpen(true) }
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null) }

  const handleSave = async (data: FormData) => {
    if (!selectedBusiness) return
    setSaving(true)
    const startUtc = `${data.startDate}T00:00:00Z`
    const dueUtc = `${data.nextDueDate}T00:00:00Z`
    try {
      if (editTarget) {
        const updated = await recurringPaymentsApi.update(selectedBusiness.id, editTarget.id, {
          description: data.description,
          amount: Number(data.amount),
          billingCycle: data.billingCycle,
          nextDueDate: dueUtc,
          isActive: data.isActive,
          clientId: data.clientId || undefined,
          notes: data.notes || undefined,
        })
        setPayments((prev) => prev.map((p) => p.id === updated.id ? updated : p))
        toast.success('Payment updated.')
      } else {
        const created = await recurringPaymentsApi.create(selectedBusiness.id, {
          description: data.description,
          amount: Number(data.amount),
          billingCycle: data.billingCycle,
          startDate: startUtc,
          nextDueDate: dueUtc,
          clientId: data.clientId || undefined,
          notes: data.notes || undefined,
        })
        setPayments((prev) => [created, ...prev])
        toast.success('Payment added.')
      }
      closeDialog()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { title?: string } } })?.response?.data?.title
        ?? 'Something went wrong. Please try again.'
      toast.error(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: RecurringPayment) => {
    if (!selectedBusiness) return
    if (!window.confirm(`Delete "${p.description}"? This cannot be undone.`)) return
    try {
      await recurringPaymentsApi.delete(selectedBusiness.id, p.id)
      setPayments((prev) => prev.filter((x) => x.id !== p.id))
      toast.success('Payment deleted.')
    } catch (err) {
      toast.error('Could not delete payment. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">{selectedBusiness?.name ?? 'Dashboard'}</span>
          {' / '}
          <span>Recurring Payments</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8 space-y-6">
        {/* Page heading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Recurring Payments</h1>
            <p className="text-sm text-muted-foreground">Manage subscriptions and repeat obligations</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus size={16} />
            Add Payment
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${card.highlight ? 'text-destructive' : 'text-foreground'}`}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base font-semibold">All Recurring Payments</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search payments…"
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-52"
                  />
                </div>
                <Select value={cycleFilter} onValueChange={setCycleFilter}>
                  <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Cycles</SelectItem>
                    {BILLING_CYCLES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      {search || cycleFilter !== 'All' || statusFilter !== 'All'
                        ? 'No payments match your filters.'
                        : 'No recurring payments yet. Add your first one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id} className={!p.isActive ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <RefreshCw size={15} className="text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{p.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.clientName ?? <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={CYCLE_STYLES[p.billingCycle]}>
                          {p.billingCycle}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{fmt(p.amount, currency)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{fmtDate(p.nextDueDate)}</span>
                          {p.isActive && (
                            <span className={`text-xs ${p.daysUntilNextDue <= 3 ? 'text-destructive' : p.daysUntilNextDue <= 7 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              {p.daysUntilNextDue === 0
                                ? 'Due today'
                                : p.daysUntilNextDue < 0
                                  ? `${Math.abs(p.daysUntilNextDue)}d overdue`
                                  : `in ${p.daysUntilNextDue}d`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={p.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-0'
                            : 'bg-muted text-muted-foreground border-0'}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(p)} className="gap-2">
                              <Pencil size={14} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(p)}
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 size={14} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <RecurringPaymentFormDialog
        key={dialogOpen ? (editTarget?.id ?? 'new') : 'closed'}
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        initial={editTarget}
        clients={clients}
        saving={saving}
      />
    </div>
  )
}
