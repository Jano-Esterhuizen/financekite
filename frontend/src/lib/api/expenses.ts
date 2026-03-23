import api from './axios'
import { Expense } from '@/lib/types'

export const expensesApi = {
  getAll: (businessId: string) =>
    api.get<Expense[]>(`/api/businesses/${businessId}/expenses`).then(r => r.data),

  getById: (businessId: string, id: string) =>
    api.get<Expense>(`/api/businesses/${businessId}/expenses/${id}`).then(r => r.data),

  create: (businessId: string, data: {
    description: string
    amount: number
    date: string
    category: string
    clientId?: string
    notes?: string
  }) => api.post<Expense>(`/api/businesses/${businessId}/expenses`, data).then(r => r.data),

  update: (businessId: string, id: string, data: {
    description: string
    amount: number
    date: string
    category: string
    clientId?: string
    notes?: string
  }) => api.put<Expense>(`/api/businesses/${businessId}/expenses/${id}`, data).then(r => r.data),

  uploadProof: (businessId: string, id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<Expense>(
      `/api/businesses/${businessId}/expenses/${id}/upload-proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ).then(r => r.data)
  },

  getProofUrl: (businessId: string, id: string, download = false) =>
    api.get<{ url: string; download: boolean }>(
      `/api/businesses/${businessId}/expenses/${id}/proof-url`,
      { params: { download } }
    ).then(r => r.data),

  deleteProof: (businessId: string, id: string) =>
    api.delete(`/api/businesses/${businessId}/expenses/${id}/proof`),

  delete: (businessId: string, id: string) =>
    api.delete(`/api/businesses/${businessId}/expenses/${id}`),
}