'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import MobileSidebar from './MobileSidebar'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

interface HeaderProps {
  orgSlug: string
  orgName: string
  userEmail: string
}

export default function Header({ orgSlug, orgName, userEmail }: HeaderProps) {
  const router = useRouter()
  const t = useTranslations('nav')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
      <MobileSidebar orgSlug={orgSlug} orgName={orgName} />
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-white/40 truncate max-w-[200px]">
          {userEmail}
        </span>
        <LanguageSwitcher />
        <button
          onClick={handleLogout}
          aria-label={t('logout')}
          className="p-2 text-white/40 hover:text-neon-blue hover:bg-neon-blue/8 transition-all duration-200"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
