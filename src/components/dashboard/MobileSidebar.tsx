'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { SidebarNav } from './Sidebar'

interface MobileSidebarProps {
  orgSlug: string
  orgName: string
}

export default function MobileSidebar({ orgSlug, orgName }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('nav')

  return (
    <>
      <button
        className="md:hidden p-2 text-white/40 hover:text-neon-blue hover:bg-neon-blue/8 transition-all duration-200"
        onClick={() => setOpen(true)}
        aria-label={t('openMenu')}
      >
        <Menu size={18} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 glass border-r border-white/10">
            <button
              className="absolute top-3 right-3 p-1.5 text-white/40 hover:text-white hover:bg-white/8 transition-all"
              onClick={() => setOpen(false)}
              aria-label={t('closeMenu')}
            >
              <X size={15} />
            </button>
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
