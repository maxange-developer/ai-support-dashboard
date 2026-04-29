'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarNav } from './Sidebar'

interface MobileSidebarProps {
  orgSlug: string
  orgName: string
}

export default function MobileSidebar({ orgSlug, orgName }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
      >
        <Menu size={20} />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 w-56 bg-card border-r">
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Chiudi menu"
              >
                <X size={16} />
              </Button>
            </div>
            <SidebarNav
              orgSlug={orgSlug}
              orgName={orgName}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </>
  )
}
