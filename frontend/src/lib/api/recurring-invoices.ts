import api from './axios'
import { RecurringInvoice } from '@/lib/types'

export const recurringInvoicesApi = {
  getAll: (businessId: string) =>
    api.get<RecurringInvoice[]>(`/api/businesses/${businessId}/recurring-invoices`).then(r => r.data),

  getById: (businessId: string, id: string) =>
    api.get<RecurringInvoice>(`/api/businesses/${businessId}/recurring-invoices/${id}`).then(r => r.data),

  create: (businessId: string, data: {
    description: string
    amount: number
    billingCycle: string
    startDate: string
    nextDueDate: string
    clientId: string
    notes?: string
  }) => api.post<RecurringInvoice>(
    `/api/businesses/${businessId}/recurring-invoices`, data
  ).then(r => r.data),

  update: (businessId: string, id: string, data: {
    description: string
    amount: number
    billingCycle: string
    nextDueDate: string
    isActive: boolean
    clientId: string
    notes?: string
  }) => api.put<RecurringInvoice>(
    `/api/businesses/${businessId}/recurring-invoices/${id}`, data
  ).then(r => r.data),

  delete: (businessId: string, id: string) =>
    api.delete(`/api/businesses/${businessId}/recurring-invoices/${id}`),
}
