'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
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
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBusiness } from '@/lib/contexts/BusinessContext'
import { createClient } from '@/lib/supabase/client'

const navSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Clients', href: '/dashboard/clients', icon: Users },
      { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
      { label: 'Recurring Payments', href: '/dashboard/recurring-payments', icon: RefreshCw },
    ],
  },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusiness()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <aside className="flex flex-col w-64 h-screen bg-card border-r border-border px-4 py-6 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">FK</span>
        </div>
        <span className="font-semibold text-foreground text-lg">FinanceKite</span>
      </div>

      {/* Business picker */}
      {selectedBusiness && (
        <div className="mb-6 px-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-accent transition-colors outline-none">
              <span className="truncate">{selectedBusiness.name}</span>
              <ChevronDown size={14} className="text-muted-foreground flex-shrink-0 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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
    </aside>
  )
}
