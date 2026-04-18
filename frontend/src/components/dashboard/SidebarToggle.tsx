'use client'

import { PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/lib/contexts/SidebarContext'

export default function SidebarToggle() {
  const { toggle } = useSidebar()

  return (
    <div className="flex items-center mr-3">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        title="Toggle sidebar"
      >
        <PanelLeft size={18} />
      </Button>
      <Separator orientation="vertical" className="ml-3 h-5" />
    </div>
  )
}
