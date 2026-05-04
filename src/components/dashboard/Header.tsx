'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import MobileSidebar from './MobileSidebar'

interface HeaderProps {
  orgSlug: string
  orgName: string
  userEmail: string
}

export default function Header({ orgSlug, orgName, userEmail }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-14 items-center border-b border-white/10 px-4 gap-3 shrink-0 glass">
      <MobileSidebar orgSlug={orgSlug} orgName={orgName} />
      <div className="flex-1" />
      <span className="hidden sm:block text-xs text-white/40 truncate max-w-[200px]">
        {userEmail}
      </span>
      <button
        onClick={handleLogout}
        aria-label="Logout"
        className="p-2 rounded-lg text-white/40 hover:text-neon-blue hover:bg-neon-blue/8 transition-all duration-200"
      >
        <LogOut size={15} />
      </button>
    </header>
  )
}
