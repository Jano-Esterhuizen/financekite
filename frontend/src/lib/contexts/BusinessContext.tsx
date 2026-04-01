'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Business } from '@/lib/types'

interface BusinessContextValue {
  businesses: Business[]
  setBusinesses: (businesses: Business[]) => void
  selectedBusiness: Business | null
  setSelectedBusiness: (business: Business) => void
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  return (
    <BusinessContext.Provider value={{ businesses, setBusinesses, selectedBusiness, setSelectedBusiness }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}
