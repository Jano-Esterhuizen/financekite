import api from './axios'
import { Invoice } from '@/lib/types'

export const invoicesApi = {
  getAll: (businessId: string) =>
    api.get<Invoice[]>(`/api/businesses/${businessId}/invoices`).then(r => r.data),

  getById: (businessId: string, id: string) =>
    api.get<Invoice>(`/api/businesses/${businessId}/invoices/${id}`).then(r => r.data),

  getOverdue: (businessId: string) =>
    api.get<Invoice[]>(`/api/businesses/${businessId}/invoices/overdue`).then(r => r.data),

  create: (businessId: string, data: {
    clientId: string
    invoiceNumber: string
    amount: number
    issuedDate: string
    dueDate: string
    notes?: string
  }) => api.post<Invoice>(`/api/businesses/${businessId}/invoices`, data).then(r => r.data),

  update: (businessId: string, id: string, data: {
    invoiceNumber: string
    amount: number
    status: string
    issuedDate: string
    dueDate: string
    notes?: string
  }) => api.put<Invoice>(`/api/businesses/${businessId}/invoices/${id}`, data).then(r => r.data),

  uploadDocument: (businessId: string, id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<Invoice>(
      `/api/businesses/${businessId}/invoices/${id}/upload-document`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ).then(r => r.data)
  },

  getDocumentUrl: (businessId: string, id: string, download = false) =>
    api.get<{ url: string; download: boolean }>(
      `/api/businesses/${businessId}/invoices/${id}/document-url`,
      { params: { download } }
    ).then(r => r.data),

  deleteDocument: (businessId: string, id: string) =>
    api.delete(`/api/businesses/${businessId}/invoices/${id}/document`),

  delete: (businessId: string, id: string) =>
    api.delete(`/api/businesses/${businessId}/invoices/${id}`),
}