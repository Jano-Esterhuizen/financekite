import api from './axios'
import { Business, FinancialSummary } from '@/lib/types'

export const businessesApi = {
  getAll: () =>
    api.get<Business[]>('/api/businesses').then(r => r.data),

  getById: (id: string) =>
    api.get<Business>(`/api/businesses/${id}`).then(r => r.data),

  getFinancialSummary: (id: string) =>
    api.get<FinancialSummary>(`/api/businesses/${id}/summary`).then(r => r.data),

  create: (data: { name: string; description?: string; currencyCode: string }) =>
    api.post<Business>('/api/businesses', data).then(r => r.data),

  update: (id: string, data: { name: string; description?: string; currencyCode: string }) =>
    api.put<Business>(`/api/businesses/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/businesses/${id}`),
}