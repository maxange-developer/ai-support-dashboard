'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  FileText,
  MessageSquare,
  Code2,
  MessageCircle,
  Settings,
} from 'lucide-react'

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

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold text-sm truncate">{orgName}</span>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const fullPath = `/app/${orgSlug}/${href}`
          const isActive = pathname.startsWith(fullPath)
          return (
            <Link
              key={href}
              href={fullPath}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon size={16} aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default function Sidebar({ orgSlug, orgName }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-card shrink-0">
      <SidebarNav orgSlug={orgSlug} orgName={orgName} />
    </aside>
  )
}
