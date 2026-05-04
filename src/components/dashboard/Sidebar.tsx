'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FileText, MessageSquare, Code2, MessageCircle, Settings, Zap } from 'lucide-react'

const NAV_ITEMS = [
  { href: 'documents', label: 'Documents', icon: FileText },
  { href: 'playground', label: 'Playground', icon: MessageSquare },
  { href: 'embed', label: 'Embed', icon: Code2 },
  { href: 'conversations', label: 'Conversations', icon: MessageCircle },
  { href: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  orgSlug: string
  orgName: string
  onNavigate?: () => void
}

export function SidebarNav({ orgSlug, orgName, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-5 border-b border-white/10 shrink-0">
        <Zap size={18} className="text-neon-blue shrink-0" aria-hidden />
        <span className="font-bold text-base tracking-widest text-neon-blue neon-text">Angel1</span>
      </div>

      {/* Org name */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Organization</p>
        <p className="text-sm text-white/80 font-medium mt-0.5 truncate">{orgName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const fullPath = `/app/${orgSlug}/${href}`
          const isActive = mounted && pathname.startsWith(fullPath)
          return (
            <Link
              key={href}
              href={fullPath}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 py-2.5 text-sm uppercase tracking-wider font-medium transition-all duration-200',
                isActive
                  ? 'text-neon-blue opacity-100 bg-neon-blue/10 border-l-2 border-neon-blue pl-[calc(1.25rem-2px)] pr-4 rounded-r-lg'
                  : 'text-neon-blue opacity-40 hover:opacity-70 px-5',
              )}
            >
              <Icon size={15} aria-hidden className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-white/10 mt-auto">
        <p className="text-[10px] text-white/25 uppercase tracking-widest">AI Support Dashboard</p>
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
