'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FileText, MessageSquare, CodeXml, MessageCircle, Settings } from 'lucide-react'

type NavItem = {
  href: string
  key: string
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '', key: 'dashboard', icon: LayoutDashboard, exact: true },
  { href: 'documents', key: 'documents', icon: FileText },
  { href: 'playground', key: 'playground', icon: MessageSquare },
  { href: 'embed', key: 'embed', icon: CodeXml },
  { href: 'conversations', key: 'conversations', icon: MessageCircle },
  { href: 'settings', key: 'settings', icon: Settings },
]

interface SidebarProps {
  orgSlug: string
  orgName: string
  onNavigate?: () => void
}

function getFullPath(orgSlug: string, href: string) {
  return href ? `/app/${orgSlug}/${href}` : `/app/${orgSlug}`
}

function getActiveIndex(pathname: string, orgSlug: string): number {
  // Check exact match for dashboard first, then prefix match for others
  for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
    const { href, exact } = NAV_ITEMS[i]
    const fullPath = getFullPath(orgSlug, href)
    if (exact ? pathname === fullPath : pathname.startsWith(fullPath)) return i
  }
  return -1
}

export function SidebarNav({ orgSlug, orgName, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [mounted, setMounted] = useState(false)
  const [beamKey, setBeamKey] = useState<string | null>(null)
  const prevIndexRef = useRef<number>(-1)

  useEffect(() => setMounted(true), [])

  const activeIndex = mounted ? getActiveIndex(pathname, orgSlug) : -1

  function handleClick(index: number, href: string) {
    prevIndexRef.current = activeIndex
    setBeamKey(`${href}-${Date.now()}`)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-white/10 shrink-0">
        <Image
          src="/images/logo-a1-w.webp"
          width={120}
          height={48}
          alt="Angel1"
          className="object-contain w-auto h-auto"
          priority
        />
      </div>

      {/* Org name */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{t('organization')}</p>
        <p className="text-sm text-white/80 font-medium mt-0.5 truncate">{orgName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, key, icon: Icon }, index) => {
          const fullPath = getFullPath(orgSlug, href)
          const isActive = mounted && activeIndex === index

          return (
            <Link
              key={href}
              href={fullPath}
              onClick={() => handleClick(index, href)}
              className={cn(
                'relative flex items-center gap-3 py-2.5 px-5 text-sm uppercase tracking-wider font-medium transition-colors duration-200 overflow-hidden',
                isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
              )}
            >
              {/* Sliding background indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 bg-white/10 border-l-2 border-white"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              {/* Hover background for inactive */}
              {!isActive && (
                <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors duration-200" />
              )}

              {/* Beam on click */}
              <AnimatePresence>
                {beamKey && beamKey.startsWith(href + '-') && (
                  <motion.div
                    key={beamKey}
                    className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent pointer-events-none"
                    initial={{ x: '-100%', opacity: 1 }}
                    animate={{ x: '100%', opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    onAnimationComplete={() => setBeamKey(null)}
                  />
                )}
              </AnimatePresence>

              <Icon size={15} aria-hidden className="relative z-10 shrink-0" />
              <span className="relative z-10">{t(key)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/10 mt-auto">
        <p className="text-[10px] text-white/25 uppercase tracking-widest">{t('appLabel')}</p>
      </div>
    </div>
  )
}

export default function Sidebar({ orgSlug, orgName }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-60 flex-col glass border-r border-white/10 shrink-0">
      <SidebarNav orgSlug={orgSlug} orgName={orgName} />
    </aside>
  )
}
