// Matches our .NET API response DTOs exactly

export interface Business {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  currencyCode: string
  isArchived: boolean
  createdAt: string
}

export interface Client {
  id: string
  businessId: string
  name: string
  companyName: string | null
  email: string | null
  phone: string | null
  address: string | null
  isArchived: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  businessId: string
  clientId: string
  clientName: string
  invoiceNumber: string
  amount: number
  status: 'Pending' | 'Paid' | 'Overdue' | 'Loss'
  issuedDate: string
  dueDate: string
  documentUrl: string | null
  notes: string | null
  daysUntilDue: number
  daysOverdue: number
  isDueSoon: boolean
  createdAt: string
}

export interface Expense {
  id: string
  businessId: string
  clientId: string | null
  clientName: string | null
  description: string
  amount: number
  date: string
  category: 'Hosting' | 'Domain' | 'Tools' | 'Service' | 'Other'
  proofOfPaymentUrl: string | null
  notes: string | null
  createdAt: string
}

export interface RecurringPayment {
  id: string
  businessId: string
  clientId: string | null
  clientName: string | null
  description: string
  amount: number
  billingCycle: 'Weekly' | 'Monthly' | 'Yearly'
  startDate: string
  nextDueDate: string
  isActive: boolean
  daysUntilNextDue: number
  notes: string | null
  createdAt: string
}

export interface FinancialSummary {
  totalPaid: number
  totalOutstanding: number
  totalExpenses: number
  futureProfit: number
}

export interface ClientHealth {
  clientId: string
  clientName: string
  totalInvoiced: number
  outstandingBalance: number
}