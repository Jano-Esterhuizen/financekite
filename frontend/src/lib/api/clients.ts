import api from './axios'
import { Client, ClientHealth } from '@/lib/types'

export const clientsApi = {
  getAll: (businessId: string) =>
    api.get<Client[]>(`/api/businesses/${businessId}/clients`).then(r => r.data),

  getById: (businessId: string, id: string) =>
    api.get<Client>(`/api/businesses/${businessId}/clients/${id}`).then(r => r.data),

  getHealth: (businessId: string, id: string) =>
    api.get<ClientHealth>(`/api/businesses/${businessId}/clients/${id}/health`).then(r => r.data),

  create: (businessId: string, data: {
    name: string
    companyName?: string
    email?: string
    phone?: string
    address?: string
  }) => api.post<Client>(`/api/businesses/${businessId}/clients`, data).then(r => r.data),

  update: (businessId: string, id: string, data: {
    name: string
    companyName?: string
    email?: string
    phone?: string
    address?: string
  }) => api.put<Client>(`/api/businesses/${businessId}/clients/${id}`, data).then(r => r.data),

  delete: (businessId: string, id: string) =>
    api.delete(`/api/businesses/${businessId}/clients/${id}`),
}