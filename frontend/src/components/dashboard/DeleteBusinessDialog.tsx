'use client'

import { useState } from 'react'
import type { Business } from '@/lib/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TriangleAlert } from 'lucide-react'

interface DeleteBusinessDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  business: Business | null
  deleting: boolean
}

export default function DeleteBusinessDialog({ open, onClose, onConfirm, business, deleting }: DeleteBusinessDialogProps) {
  const [confirmation, setConfirmation] = useState('')

  const nameMatches = confirmation === business?.name

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Business</DialogTitle>
          <DialogDescription>
            You are about to permanently delete <strong>{business?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 space-y-2">
          <div className="flex items-center gap-2 font-medium text-destructive text-sm">
            <TriangleAlert size={16} />
            This will permanently delete:
          </div>
          <ul className="list-disc list-inside text-sm text-destructive/90 space-y-0.5 pl-1">
            <li>All clients and their data</li>
            <li>All invoices</li>
            <li>All expenses</li>
            <li>All recurring payments</li>
          </ul>
          <p className="text-sm font-semibold text-destructive">This action cannot be undone.</p>
        </div>

        <div className="space-y-1.5 pt-1">
          <Label htmlFor="delete-confirm">
            Type <strong>{business?.name}</strong> to confirm
          </Label>
          <Input
            id="delete-confirm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={business?.name ?? ''}
            autoComplete="off"
          />
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting || !nameMatches}
          >
            {deleting ? 'Deleting\u2026' : 'Delete Business'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
