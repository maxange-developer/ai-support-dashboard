'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SidebarNav } from './Sidebar'
import type { WorkspaceOption } from './WorkspaceSwitcher'

interface MobileSidebarProps {
  orgSlug: string
  orgName: string
  workspaces?: WorkspaceOption[]
}

export default function MobileSidebar({ orgSlug, orgName, workspaces }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('nav')

  // Avoid SSR/hydration mismatch — document.body is client-only
  useEffect(() => setMounted(true), [])

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[55] bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="fixed inset-y-0 left-0 z-[60] w-[85vw] max-w-xs bg-[#0a0a0a] border-r border-white/10"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
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
              workspaces={workspaces}
              onNavigate={() => setOpen(false)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <button
        className="md:hidden p-2 text-white/40 hover:text-neon-blue hover:bg-neon-blue/8 transition-all duration-200"
        onClick={() => setOpen(true)}
        aria-label={t('openMenu')}
      >
        <Menu size={18} />
      </button>

      {/* Portal: renders at document.body, escaping the Header's -webkit-backdrop-filter
          stacking context which traps fixed children on iOS Safari */}
      {mounted && createPortal(drawer, document.body)}
    </>
  )
}
