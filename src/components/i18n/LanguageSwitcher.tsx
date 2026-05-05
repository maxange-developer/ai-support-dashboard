'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { setLocale } from '@/app/actions/locale'

const FLAG_MAP: Record<string, string> = { en: 'gb', it: 'it', es: 'es' }
const LOCALES = ['en', 'it', 'es']

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
    <div className="flex items-center gap-1.5">
      {LOCALES.map((code) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={isPending || locale === code}
          aria-label={`Switch to ${code.toUpperCase()}`}
          className={cn(
            'w-7 h-7 rounded-full overflow-hidden border-2 transition-all duration-200 disabled:cursor-default',
            locale === code
              ? 'border-neon-blue opacity-100'
              : 'border-white/20 opacity-50 hover:opacity-80',
          )}
        >
          <Image
            src={`https://flagcdn.com/w40/${FLAG_MAP[code]}.png`}
            alt={code}
            width={28}
            height={28}
            className="w-full h-full object-cover"
            unoptimized
          />
        </button>
      ))}
    </div>
  )
}
