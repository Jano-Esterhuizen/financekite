'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Search, Receipt, Eye, Upload, MoreHorizontal, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { expensesApi } from '@/lib/api/expenses'
import { clientsApi } from '@/lib/api/clients'
import type { Expense, Client } from '@/lib/types'
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

const CATEGORIES = ['Hosting', 'Domain', 'Tools', 'Service', 'Other'] as const
type ExpenseCategory = typeof CATEGORIES[number]

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  Hosting: 'bg-primary/10 text-primary border-0',
  Domain:  'bg-blue-500/10 text-blue-600 border-0',
  Tools:   'bg-purple-500/10 text-purple-600 border-0',
  Service: 'bg-amber-500/10 text-amber-600 border-0',
  Other:   'bg-muted text-muted-foreground border-0',
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

function startOfMonthIso() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
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

// ── expense form dialog ───────────────────────────────────────────────────────

interface ExpenseFormData {
  description: string
  amount: string
  date: string
  category: ExpenseCategory
  clientId: string
  notes: string
}

interface ExpenseFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: ExpenseFormData) => Promise<void>
  initial?: Expense | null
  clients: Client[]
  saving: boolean
}

function ExpenseFormDialog({ open, onClose, onSave, initial, clients, saving }: ExpenseFormDialogProps) {
  const blank: ExpenseFormData = {
    description: '',
    amount: '',
    date: todayIso(),
    category: 'Other',
    clientId: '',
    notes: '',
  }

  const [form, setForm] = useState<ExpenseFormData>(blank)

  useEffect(() => {
    if (initial) {
      setForm({
        description: initial.description,
        amount: String(initial.amount),
        date: initial.date.slice(0, 10),
        category: initial.category as ExpenseCategory,
        clientId: initial.clientId ?? '',
        notes: initial.notes ?? '',
      })
    } else {
      setForm(blank)
    }
  }, [initial, open])

  const set = (key: keyof ExpenseFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const valid = form.description.trim() && Number(form.amount) > 0 && form.date && form.category

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    await onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-desc">Description <span className="text-destructive">*</span></Label>
            <Input
              id="exp-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="e.g. Monthly Vercel hosting"
              required
            />
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">Amount <span className="text-destructive">*</span></Label>
              <Input
                id="exp-amount"
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
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-date">Date <span className="text-destructive">*</span></Label>
            <Input
              id="exp-date"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
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

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-notes">Notes</Label>
            <textarea
              id="exp-notes"
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
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const { selectedBusiness } = useBusiness()
  const currency = selectedBusiness?.currencyCode ?? 'ZAR'

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [saving, setSaving] = useState(false)

  // per-expense proof loading states
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deletingProofId, setDeletingProofId] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // ── fetch ──
  useEffect(() => {
    if (!selectedBusiness) return
    setLoading(true)
    Promise.all([
      expensesApi.getAll(selectedBusiness.id),
      clientsApi.getAll(selectedBusiness.id),
    ])
      .then(([expData, clientData]) => {
        setExpenses(expData)
        setClients(clientData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedBusiness])

  // ── derived ──
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)

  const thisMonthTotal = expenses
    .filter((e) => new Date(e.date) >= new Date(startOfMonthIso()))
    .reduce((s, e) => s + e.amount, 0)

  // top category by spend
  const categoryTotals = CATEGORIES.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }))
  const topCategory = categoryTotals.reduce((a, b) => b.total > a.total ? b : a, { cat: 'Other' as ExpenseCategory, total: 0 })

  const missingProof = expenses.filter((e) => !e.proofOfPaymentUrl).length

  const summaryCards = [
    { label: 'Total Expenses', value: String(expenses.length), sub: fmt(totalAmount, currency) },
    { label: 'This Month', value: fmt(thisMonthTotal, currency), sub: 'Current month spend' },
    { label: 'Top Category', value: topCategory.cat, sub: fmt(topCategory.total, currency) },
    {
      label: 'Missing Proof',
      value: String(missingProof),
      sub: missingProof > 0 ? 'Upload receipts' : 'All proofs attached',
      highlight: missingProof > 0,
    },
  ]

  const filtered = expenses.filter((exp) => {
    const q = search.toLowerCase()
    const matchSearch =
      exp.description.toLowerCase().includes(q) ||
      (exp.clientName ?? '').toLowerCase().includes(q)
    const matchCat = categoryFilter === 'All' || exp.category === categoryFilter
    return matchSearch && matchCat
  })

  // ── actions ──
  const openAdd = () => { setEditTarget(null); setDialogOpen(true) }
  const openEdit = (exp: Expense) => { setEditTarget(exp); setDialogOpen(true) }
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null) }

  const handleSave = async (data: ExpenseFormData) => {
    if (!selectedBusiness) return
    setSaving(true)
    // Append Z so .NET deserializes as Kind=Utc — Npgsql requires UTC for timestamptz columns
    const dateUtc = `${data.date}T00:00:00Z`
    try {
      if (editTarget) {
        const updated = await expensesApi.update(selectedBusiness.id, editTarget.id, {
          description: data.description,
          amount: Number(data.amount),
          date: dateUtc,
          category: data.category,
          clientId: data.clientId || undefined,
          notes: data.notes || undefined,
        })
        setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e))
      } else {
        const created = await expensesApi.create(selectedBusiness.id, {
          description: data.description,
          amount: Number(data.amount),
          date: dateUtc,
          category: data.category,
          clientId: data.clientId || undefined,
          notes: data.notes || undefined,
        })
        setExpenses((prev) => [created, ...prev])
      }
      closeDialog()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (exp: Expense) => {
    if (!selectedBusiness) return
    if (!window.confirm(`Delete "${exp.description}"? This cannot be undone.`)) return
    try {
      await expensesApi.delete(selectedBusiness.id, exp.id)
      setExpenses((prev) => prev.filter((e) => e.id !== exp.id))
    } catch (err) {
      console.error(err)
    }
  }

  // ── proof of payment handlers ──

  const handleViewProof = async (exp: Expense) => {
    if (!selectedBusiness) return
    setViewingId(exp.id)
    try {
      const { url } = await expensesApi.getProofUrl(selectedBusiness.id, exp.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error('Could not open proof of payment. Please try again.')
      console.error(err)
    } finally {
      setViewingId(null)
    }
  }

  const handleUploadProof = async (exp: Expense, file: File) => {
    if (!selectedBusiness) return
    setUploadingId(exp.id)
    try {
      const updated = await expensesApi.uploadProof(selectedBusiness.id, exp.id, file)
      setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e))
      toast.success('Proof of payment uploaded.')
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.file?.[0]
        ?? err?.response?.data?.title
        ?? 'Upload failed. Please try again.'
      toast.error(msg)
      console.error(err)
    } finally {
      setUploadingId(null)
    }
  }

  const handleDeleteProof = async (exp: Expense) => {
    if (!selectedBusiness) return
    if (!window.confirm(`Remove proof of payment for "${exp.description}"?`)) return
    setDeletingProofId(exp.id)
    try {
      await expensesApi.deleteProof(selectedBusiness.id, exp.id)
      setExpenses((prev) => prev.map((e) =>
        e.id === exp.id ? { ...e, proofOfPaymentUrl: null } : e
      ))
      toast.success('Proof of payment removed.')
    } catch (err) {
      toast.error('Could not remove proof. Please try again.')
      console.error(err)
    } finally {
      setDeletingProofId(null)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">{selectedBusiness?.name ?? 'Dashboard'}</span>
          {' / '}
          <span>Expenses</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Page heading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Expenses</h1>
            <p className="text-sm text-muted-foreground">Track and manage your business expenses</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus size={16} />
            Add Expense
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
              <CardTitle className="text-base font-semibold">All Expenses</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search expenses…"
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-52"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      {search || categoryFilter !== 'All'
                        ? 'No expenses match your filters.'
                        : 'No expenses yet. Add your first expense.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {fmtDate(exp.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Receipt size={15} className="text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{exp.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={CATEGORY_STYLES[exp.category as ExpenseCategory] ?? CATEGORY_STYLES.Other}
                        >
                          {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exp.clientName ?? <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="font-medium">{fmt(exp.amount, currency)}</TableCell>
                      <TableCell>
                        {/* PDF / image hidden file input per row */}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[exp.id] = el }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadProof(exp, file)
                            e.target.value = ''
                          }}
                        />
                        {exp.proofOfPaymentUrl ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-7 text-xs"
                              disabled={viewingId === exp.id}
                              onClick={() => handleViewProof(exp)}
                            >
                              {viewingId === exp.id
                                ? <Loader2 size={13} className="animate-spin" />
                                : <Eye size={13} />}
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              disabled={deletingProofId === exp.id}
                              onClick={() => handleDeleteProof(exp)}
                              title="Remove proof"
                            >
                              {deletingProofId === exp.id
                                ? <Loader2 size={13} className="animate-spin" />
                                : <X size={13} />}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-7 text-xs text-muted-foreground"
                            disabled={uploadingId === exp.id}
                            onClick={() => fileInputRefs.current[exp.id]?.click()}
                          >
                            {uploadingId === exp.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Upload size={13} />}
                            {uploadingId === exp.id ? 'Uploading…' : 'Upload'}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(exp)} className="gap-2">
                              <Pencil size={14} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(exp)}
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

      <ExpenseFormDialog
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
