'use client'

import { useEffect } from 'react'
import { BusinessProvider, useBusiness } from '@/lib/contexts/BusinessContext'
import AppSidebar from '@/components/dashboard/AppSidebar'
import { businessesApi } from '@/lib/api/businesses'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { setBusinesses, setSelectedBusiness, selectedBusiness } = useBusiness()

  useEffect(() => {
    businessesApi.getAll().then((data) => {
      setBusinesses(data)
      if (data.length > 0) setSelectedBusiness(data[0])
    }).catch(console.error)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <DashboardShell>{children}</DashboardShell>
    </BusinessProvider>
  )
}
