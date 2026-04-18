'use client'

import { useState } from 'react'
import type { Business } from '@/lib/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface BusinessFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; description?: string; currencyCode: string }) => Promise<void>
  initial?: Business | null
  saving: boolean
}

const currencies = [
  { value: 'ZAR', label: 'ZAR — South African Rand' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
]

export default function BusinessFormDialog({ open, onClose, onSave, initial, saving }: BusinessFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [currencyCode, setCurrencyCode] = useState(initial?.currencyCode ?? 'ZAR')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      currencyCode,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Business' : 'New Business'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="biz-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="biz-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Business"
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="biz-desc">Description</Label>
            <textarea
              id="biz-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your business"
              maxLength={500}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="biz-currency">Currency</Label>
            <Select value={currencyCode} onValueChange={setCurrencyCode}>
              <SelectTrigger id="biz-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Saving\u2026' : initial ? 'Save Changes' : 'Create Business'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
