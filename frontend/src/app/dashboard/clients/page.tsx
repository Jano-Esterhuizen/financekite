'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Building2, Mail, Phone, Archive, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { clientsApi } from '@/lib/api/clients'
import type { Client } from '@/lib/types'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// ── client form dialog ────────────────────────────────────────────────────────

interface ClientFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; companyName?: string; email?: string; phone?: string }) => Promise<void>
  initial?: Client | null
  saving: boolean
}

function ClientFormDialog({ open, onClose, onSave, initial, saving }: ClientFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [company, setCompany] = useState(initial?.companyName ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')

  // Sync fields when initial changes (opening edit dialog)
  useEffect(() => {
    setName(initial?.name ?? '')
    setCompany(initial?.companyName ?? '')
    setEmail(initial?.email ?? '')
    setPhone(initial?.phone ?? '')
  }, [initial, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSave({
      name: name.trim(),
      companyName: company.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@acme.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27 82 000 0000" />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { selectedBusiness } = useBusiness()
  const currency = selectedBusiness?.currencyCode ?? 'ZAR'

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

  // ── fetch ──
  useEffect(() => {
    if (!selectedBusiness) return
    setLoading(true)
    clientsApi.getAll(selectedBusiness.id)
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedBusiness])

  // ── derived values ──
  const activeCount = clients.filter((c) => !c.isArchived).length
  const archivedCount = clients.filter((c) => c.isArchived).length

  const allInvoiced = clients.reduce((sum, c) => {
    return sum + (c.invoices ?? []).reduce((s, inv) => s + inv.amount, 0)
  }, 0)

  const allOutstanding = clients.reduce((sum, c) => {
    return sum + (c.invoices ?? [])
      .filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue')
      .reduce((s, inv) => s + inv.amount, 0)
  }, 0)

  const summaryCards = [
    { label: 'Total Clients', value: String(clients.length), sub: `${activeCount} active` },
    { label: 'Archived', value: String(archivedCount), sub: 'Inactive clients' },
    { label: 'Total Invoiced', value: fmt(allInvoiced), sub: 'All-time revenue' },
    { label: 'Outstanding', value: fmt(allOutstanding), sub: 'Awaiting payment', highlight: allOutstanding > 0 },
  ]

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName ?? '').toLowerCase().includes(q)
    )
  })

  // ── actions ──
  const openAdd = () => { setEditTarget(null); setDialogOpen(true) }
  const openEdit = (client: Client) => { setEditTarget(client); setDialogOpen(true) }
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null) }

  const handleSave = async (data: { name: string; companyName?: string; email?: string; phone?: string }) => {
    if (!selectedBusiness) return
    setSaving(true)
    try {
      if (editTarget) {
        const updated = await clientsApi.update(selectedBusiness.id, editTarget.id, data)
        setClients((prev) => prev.map((c) => c.id === updated.id ? { ...updated, invoices: c.invoices } : c))
      } else {
        const created = await clientsApi.create(selectedBusiness.id, data)
        setClients((prev) => [...prev, created])
      }
      closeDialog()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!selectedBusiness) return
    if (!window.confirm(`Delete "${client.name}"? This cannot be undone.`)) return
    try {
      await clientsApi.delete(selectedBusiness.id, client.id)
      setClients((prev) => prev.filter((c) => c.id !== client.id))
    } catch (err) {
      console.error(err)
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
            <span>Clients</span>
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
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground">Manage your client relationships</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus size={16} />
            Add Client
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
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base font-semibold">All Clients</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients…"
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-56"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Total Invoiced</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                      {search ? 'No clients match your search.' : 'No clients yet. Add your first client.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((client) => {
                    const invs = client.invoices ?? []
                    const totalInvoiced = invs.reduce((s, i) => s + i.amount, 0)
                    const outstanding = invs
                      .filter((i) => i.status === 'Pending' || i.status === 'Overdue')
                      .reduce((s, i) => s + i.amount, 0)
                    const paid = invs.filter((i) => i.status === 'Paid').length
                    const overdue = invs.filter((i) => i.status === 'Overdue').length

                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                              {initials(client.name)}
                            </div>
                            <span>{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.companyName ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Building2 size={14} />
                              <span>{client.companyName}</span>
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {client.email ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail size={14} />
                              <span className="truncate max-w-[160px]">{client.email}</span>
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {client.phone ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone size={14} />
                              <span>{client.phone}</span>
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {invs.length === 0 ? (
                            <span className="text-muted-foreground text-sm">—</span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">{invs.length} invoice{invs.length !== 1 ? 's' : ''}</span>
                              <span className="text-xs text-muted-foreground">{paid} paid · {overdue} overdue</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{fmt(totalInvoiced)}</TableCell>
                        <TableCell>
                          {outstanding > 0 ? (
                            <span className="font-medium text-destructive">{fmt(outstanding)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.isArchived ? (
                            <Badge variant="secondary" className="gap-1 text-muted-foreground">
                              <Archive size={12} />
                              Archived
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-success/10 text-success border-0">
                              Active
                            </Badge>
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
                              <DropdownMenuItem onClick={() => openEdit(client)} className="gap-2">
                                <Pencil size={14} />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(client)}
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 size={14} />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ClientFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        initial={editTarget}
        saving={saving}
      />
    </div>
  )
}
