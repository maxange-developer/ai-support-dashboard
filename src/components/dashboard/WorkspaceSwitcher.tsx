'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronsUpDown, Check, Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface WorkspaceOption {
  slug: string
  name: string
  plan: string
}

export function WorkspaceSwitcher({
  workspaces,
  currentSlug,
}: {
  workspaces: WorkspaceOption[]
  currentSlug: string
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('settings.plans')

  const current = workspaces.find((w) => w.slug === currentSlug) ?? workspaces[0]
  if (!current) return null

  function switchTo(slug: string) {
    const newPath = pathname.replace(/^\/app\/[^/]+/, `/app/${slug}`)
    router.push(newPath)
    setOpen(false)
  }

  const planKey = (p: string) =>
    (['free', 'pro', 'enterprise'].includes(p) ? p : 'free') as 'free' | 'pro' | 'enterprise'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] px-3 py-2.5 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.5)]">
            <Building2 className="h-3.5 w-3.5 text-white" strokeWidth={2} aria-hidden />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">{current.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {t(planKey(current.plan))}
            </p>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-white/40 flex-shrink-0" aria-hidden />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-white/10 bg-zinc-950 shadow-xl overflow-hidden"
            role="listbox"
          >
            {workspaces.map((ws) => (
              <button
                key={ws.slug}
                type="button"
                onClick={() => switchTo(ws.slug)}
                role="option"
                aria-selected={ws.slug === currentSlug}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{ws.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">
                    {t(planKey(ws.plan))}
                  </p>
                </div>
                {ws.slug === currentSlug && (
                  <Check className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
