'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { setLocale } from '@/app/actions/locale'

const LOCALES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function switchLocale(code: string) {
    startTransition(async () => {
      await setLocale(code)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-0.5">
      {LOCALES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={isPending || locale === code}
          aria-label={`Switch to ${label}`}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium uppercase tracking-wider transition-all ${
            locale === code
              ? 'text-neon-blue border border-neon-blue/40 bg-neon-blue/8'
              : 'text-white/40 hover:text-white/70 border border-transparent hover:border-white/20'
          } disabled:cursor-default`}
        >
          <span aria-hidden>{flag}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
