'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <header className="flex h-14 items-center border-b px-4 gap-3 shrink-0">
      <MobileSidebar orgSlug={orgSlug} orgName={orgName} />
      <div className="flex-1" />
      <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[200px]">
        {userEmail}
      </span>
      <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
        <LogOut size={16} />
      </Button>
    </header>
  )
}
