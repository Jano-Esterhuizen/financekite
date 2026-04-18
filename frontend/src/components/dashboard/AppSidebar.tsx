'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  RefreshCw,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { businessesApi } from '@/lib/api/businesses'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Business } from '@/lib/types'
import BusinessFormDialog from '@/components/dashboard/BusinessFormDialog'
import DeleteBusinessDialog from '@/components/dashboard/DeleteBusinessDialog'

const navSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
      { label: 'Clients', href: '/dashboard/clients', icon: Users },
      { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
      { label: 'Recurring Payments', href: '/dashboard/recurring-payments', icon: RefreshCw },
    ],
  },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { businesses, setBusinesses, selectedBusiness, setSelectedBusiness } = useBusiness()

  // Business form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Business | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = () => { setEditTarget(selectedBusiness); setFormOpen(true) }
  const closeForm = () => { setFormOpen(false); setEditTarget(null) }

  const handleSave = async (data: { name: string; description?: string; currencyCode: string }) => {
    setSaving(true)
    try {
      if (editTarget) {
        const updated = await businessesApi.update(editTarget.id, data)
        setBusinesses(businesses.map(b => b.id === updated.id ? updated : b))
        if (selectedBusiness?.id === updated.id) setSelectedBusiness(updated)
        toast.success('Business updated.')
      } else {
        const created = await businessesApi.create(data)
        setBusinesses([...businesses, created])
        setSelectedBusiness(created)
        toast.success('Business created.')
      }
      closeForm()
    } catch {
      toast.error(editTarget ? 'Could not update business.' : 'Could not create business.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBusiness) return
    setDeleting(true)
    try {
      await businessesApi.delete(selectedBusiness.id)
      const remaining = businesses.filter(b => b.id !== selectedBusiness.id)
      setBusinesses(remaining)
      setSelectedBusiness(remaining.length > 0 ? remaining[0] : null)
      setDeleteOpen(false)
      toast.success(`"${selectedBusiness.name}" deleted.`)
    } catch {
      toast.error('Could not delete business. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <aside className="flex flex-col w-64 h-screen bg-card border-r border-border px-4 py-6 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center mb-6 px-2">
        <Image src="/logo.png" alt="FinanceKite" width={160} height={40} className="object-contain" priority />
      </div>

      {/* Business picker */}
      <div className="mb-6 px-1">
        {selectedBusiness ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-accent transition-colors outline-none">
              <span className="truncate">{selectedBusiness.name}</span>
              <ChevronDown size={14} className="text-muted-foreground flex-shrink-0 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
              {businesses.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => setSelectedBusiness(b)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{b.name}</span>
                  {b.id === selectedBusiness.id && <Check size={14} className="text-primary flex-shrink-0" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Manage</DropdownMenuLabel>
              <DropdownMenuItem onClick={openCreate} className="gap-2">
                <Plus size={14} />
                New Business
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openEdit} className="gap-2">
                <Pencil size={14} />
                Edit Business
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 size={14} />
                Delete Business
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={openCreate} variant="outline" className="w-full gap-2 justify-start">
            <Plus size={14} />
            Create Your First Business
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border pt-4 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-secondary transition-colors"
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-secondary transition-colors w-full text-left"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Business management dialogs */}
      <BusinessFormDialog
        key={formOpen ? (editTarget?.id ?? 'create') : 'closed'}
        open={formOpen}
        onClose={closeForm}
        onSave={handleSave}
        initial={editTarget}
        saving={saving}
      />
      <DeleteBusinessDialog
        key={deleteOpen ? (selectedBusiness?.id ?? 'delete') : 'closed-del'}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        business={selectedBusiness}
        deleting={deleting}
      />
    </aside>
  )
}
