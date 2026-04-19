import api from './axios'
import { RecurringPayment } from '@/lib/types'

export const recurringPaymentsApi = {
  getAll: (businessId: string) =>
    api.get<RecurringPayment[]>(`/api/businesses/${businessId}/recurring-payments`).then(r => r.data),

  getById: (businessId: string, id: string) =>
    api.get<RecurringPayment>(`/api/businesses/${businessId}/recurring-payments/${id}`).then(r => r.data),

  create: (businessId: string, data: {
    description: string
    amount: number
    billingCycle: string
    startDate: string
    nextDueDate: string
    category: string
    notes?: string
  }) => api.post<RecurringPayment>(
    `/api/businesses/${businessId}/recurring-payments`, data
  ).then(r => r.data),

  update: (businessId: string, id: string, data: {
    description: string
    amount: number
    billingCycle: string
    nextDueDate: string
    isActive: boolean
    category: string
    notes?: string
  }) => api.put<RecurringPayment>(
    `/api/businesses/${businessId}/recurring-payments/${id}`, data
  ).then(r => r.data),

  delete: (businessId: string, id: string) =>
    api.delete(`/api/businesses/${businessId}/recurring-payments/${id}`),
}
