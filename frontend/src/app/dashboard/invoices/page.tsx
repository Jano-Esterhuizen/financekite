'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Search, FileText, Eye, Upload, MoreHorizontal, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { invoicesApi } from '@/lib/api/invoices'
import { clientsApi } from '@/lib/api/clients'
import type { Invoice, Client } from '@/lib/types'
import SidebarToggle from '@/components/dashboard/SidebarToggle'
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
import { extractErrorMessage } from '@/lib/utils'

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['Pending', 'Paid', 'Overdue', 'Loss'] as const
type InvoiceStatus = typeof STATUS_OPTIONS[number]

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  Paid:    'bg-success/10 text-success border-0',
  Overdue: 'bg-destructive/10 text-destructive border-0',
  Pending: 'bg-secondary text-secondary-foreground border-0',
  Loss:    'bg-muted text-muted-foreground border-0',
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

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// ── invoice form dialog ───────────────────────────────────────────────────────

interface InvoiceFormData {
  clientId: string
  invoiceNumber: string
  amount: string
  issuedDate: string
  dueDate: string
  status?: InvoiceStatus
  notes: string
}

interface InvoiceFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: InvoiceFormData) => Promise<void>
  initial?: Invoice | null
  clients: Client[]
  saving: boolean
}

function InvoiceFormDialog({ open, onClose, onSave, initial, clients, saving }: InvoiceFormDialogProps) {
  const blank: InvoiceFormData = {
    clientId: '',
    invoiceNumber: '',
    amount: '',
    issuedDate: todayIso(),
    dueDate: '',
    status: 'Pending',
    notes: '',
  }

  const [form, setForm] = useState<InvoiceFormData>(blank)

  useEffect(() => {
    if (initial) {
      setForm({
        clientId: initial.clientId,
        invoiceNumber: initial.invoiceNumber,
        amount: String(initial.amount),
        issuedDate: initial.issuedDate.slice(0, 10),
        dueDate: initial.dueDate.slice(0, 10),
        status: initial.status as InvoiceStatus,
        notes: initial.notes ?? '',
      })
    } else {
      setForm(blank)
    }
  }, [initial, open])

  const set = (key: keyof InvoiceFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const valid = form.clientId && form.invoiceNumber.trim() && Number(form.amount) > 0 && form.issuedDate && form.dueDate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    await onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Client */}
          <div className="space-y-1.5">
            <Label>Client <span className="text-destructive">*</span></Label>
            <Select value={form.clientId} onValueChange={(v) => set('clientId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.filter((c) => !c.isArchived).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}{c.companyName ? ` — ${c.companyName}` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice number + amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-number">Invoice Number <span className="text-destructive">*</span></Label>
              <Input id="inv-number" value={form.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)} placeholder="INV-001" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-amount">Amount <span className="text-destructive">*</span></Label>
              <Input id="inv-amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" required />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-issued">Issued Date <span className="text-destructive">*</span></Label>
              <Input id="inv-issued" type="date" value={form.issuedDate} onChange={(e) => set('issuedDate', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-due">Due Date <span className="text-destructive">*</span></Label>
              <Input id="inv-due" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} required />
            </div>
          </div>

          {/* Status (edit only) */}
          {initial && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-notes">Notes</Label>
            <textarea
              id="inv-notes"
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
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const { selectedBusiness } = useBusiness()
  const currency = selectedBusiness?.currencyCode ?? 'ZAR'

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)

  // per-invoice document loading states
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // ── fetch ──
  useEffect(() => {
    if (!selectedBusiness) return
    setLoading(true)
    Promise.all([
      invoicesApi.getAll(selectedBusiness.id),
      clientsApi.getAll(selectedBusiness.id),
    ])
      .then(([invData, clientData]) => {
        setInvoices(invData)
        setClients(clientData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedBusiness])

  // ── derived ──
  const totalValue = invoices.reduce((s, i) => s + i.amount, 0)
  const paidCount = invoices.filter((i) => i.status === 'Paid').length
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length
  const pendingCount = invoices.filter((i) => i.status === 'Pending').length

  const summaryCards = [
    { label: 'Total Invoices', value: String(invoices.length), sub: fmt(totalValue, currency) },
    { label: 'Paid', value: String(paidCount), sub: 'Completed', color: 'text-success' },
    { label: 'Overdue', value: String(overdueCount), sub: 'Needs attention', color: 'text-destructive' },
    { label: 'Pending', value: String(pendingCount), sub: 'Awaiting payment' },
  ]

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(q) || inv.clientName.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  // ── actions ──
  const openAdd = () => { setEditTarget(null); setDialogOpen(true) }
  const openEdit = (inv: Invoice) => { setEditTarget(inv); setDialogOpen(true) }
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null) }

  const handleSave = async (data: InvoiceFormData) => {
    if (!selectedBusiness) return
    setSaving(true)
    try {
      // Append Z so .NET deserializes as Kind=Utc — Npgsql requires UTC for timestamptz columns
      const toUtc = (d: string) => `${d}T00:00:00Z`

      if (editTarget) {
        const updated = await invoicesApi.update(selectedBusiness.id, editTarget.id, {
          invoiceNumber: data.invoiceNumber,
          amount: Number(data.amount),
          status: data.status ?? editTarget.status,
          issuedDate: toUtc(data.issuedDate),
          dueDate: toUtc(data.dueDate),
          notes: data.notes || undefined,
        })
        setInvoices((prev) => prev.map((i) => i.id === updated.id ? updated : i))
      } else {
        const created = await invoicesApi.create(selectedBusiness.id, {
          clientId: data.clientId,
          invoiceNumber: data.invoiceNumber,
          amount: Number(data.amount),
          issuedDate: toUtc(data.issuedDate),
          dueDate: toUtc(data.dueDate),
          notes: data.notes || undefined,
        })
        setInvoices((prev) => [created, ...prev])
      }
      closeDialog()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not save invoice. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (inv: Invoice) => {
    if (!selectedBusiness) return
    if (!window.confirm(`Delete invoice "${inv.invoiceNumber}"? This cannot be undone.`)) return
    try {
      await invoicesApi.delete(selectedBusiness.id, inv.id)
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id))
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not delete invoice. Please try again.'))
    }
  }

  const handleView = async (inv: Invoice) => {
    if (!selectedBusiness) return
    setViewingId(inv.id)
    try {
      const { url } = await invoicesApi.getDocumentUrl(selectedBusiness.id, inv.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error('Could not open document. Please try again.')
      console.error(err)
    } finally {
      setViewingId(null)
    }
  }

  const handleUpload = async (inv: Invoice, file: File) => {
    if (!selectedBusiness) return
    setUploadingId(inv.id)
    try {
      const updated = await invoicesApi.uploadDocument(selectedBusiness.id, inv.id, file)
      setInvoices((prev) => prev.map((i) => i.id === updated.id ? updated : i))
      toast.success('Document uploaded successfully.')
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

  const handleDeleteDocument = async (inv: Invoice) => {
    if (!selectedBusiness) return
    if (!window.confirm(`Remove the document from invoice "${inv.invoiceNumber}"?`)) return
    setDeletingDocId(inv.id)
    try {
      await invoicesApi.deleteDocument(selectedBusiness.id, inv.id)
      setInvoices((prev) => prev.map((i) =>
        i.id === inv.id ? { ...i, documentUrl: null } : i
      ))
      toast.success('Document removed.')
    } catch (err) {
      toast.error('Could not remove document. Please try again.')
      console.error(err)
    } finally {
      setDeletingDocId(null)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center">
          <SidebarToggle />
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{selectedBusiness?.name ?? 'Dashboard'}</span>
            {' / '}
            <span>Invoices</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8 space-y-6">
        {/* Page heading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground">Manage and track all your invoices</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus size={16} />
            New Invoice
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${card.color ?? 'text-foreground'}`}>{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base font-semibold">All Invoices</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search invoices…"
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-52"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
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
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                      {search || statusFilter !== 'All'
                        ? 'No invoices match your filters.'
                        : 'No invoices yet. Create your first invoice.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-muted-foreground flex-shrink-0" />
                          {inv.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell>{inv.clientName}</TableCell>
                      <TableCell className="font-medium">{fmt(inv.amount, currency)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_STYLES[inv.status as InvoiceStatus] ?? STATUS_STYLES.Pending}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(inv.issuedDate)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{fmtDate(inv.dueDate)}</div>
                        {inv.daysOverdue > 0 && (
                          <div className="text-xs text-destructive">{inv.daysOverdue}d overdue</div>
                        )}
                        {inv.isDueSoon && inv.daysUntilDue > 0 && (
                          <div className="text-xs text-muted-foreground">Due in {inv.daysUntilDue}d</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* PDF-only hidden file input per row */}
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[inv.id] = el }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUpload(inv, file)
                            e.target.value = ''
                          }}
                        />
                        {inv.documentUrl ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-7 text-xs"
                              disabled={viewingId === inv.id}
                              onClick={() => handleView(inv)}
                            >
                              {viewingId === inv.id
                                ? <Loader2 size={13} className="animate-spin" />
                                : <Eye size={13} />}
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              disabled={deletingDocId === inv.id}
                              onClick={() => handleDeleteDocument(inv)}
                              title="Remove document"
                            >
                              {deletingDocId === inv.id
                                ? <Loader2 size={13} className="animate-spin" />
                                : <X size={13} />}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-7 text-xs text-muted-foreground"
                            disabled={uploadingId === inv.id}
                            onClick={() => fileInputRefs.current[inv.id]?.click()}
                          >
                            {uploadingId === inv.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Upload size={13} />
                            )}
                            {uploadingId === inv.id ? 'Uploading…' : 'Upload PDF'}
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
                            <DropdownMenuItem onClick={() => openEdit(inv)} className="gap-2">
                              <Pencil size={14} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(inv)}
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

      <InvoiceFormDialog
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
