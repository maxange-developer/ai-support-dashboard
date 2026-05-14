'use client'

import { useState } from 'react'
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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70"
              onClick={() => setOpen(false)}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs bg-zinc-950 border-r border-white/10"
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
    </>
  )
}
