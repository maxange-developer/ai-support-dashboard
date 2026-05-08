'use client'

import { useActionState, useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertCircle } from 'lucide-react'
import { createOrgAction } from './actions'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

type State = { error: string } | null

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 32)
    .replace(/^-|-$/g, '')
}

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(createOrgAction, null)
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(toSlug(e.target.value))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <ThreeBackground />
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="glass border border-neon-blue/30 p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-bold text-white" style={{ fontSize: 'var(--fs-page)' }}>
              Crea organizzazione<span className="text-neon-blue">.</span>
            </h1>
            <p className="text-sm text-white/50">Potrai invitare altri membri in seguito.</p>
          </div>

          <form action={formAction} className="space-y-4" noValidate>
            {state && 'error' in state && state.error && (
              <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/8 text-red-400">
                <AlertCircle size={14} className="shrink-0" aria-hidden />
                <p className="text-sm">{state.error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Nome organizzazione
              </label>
              <input
                id="name"
                name="name"
                onChange={handleNameChange}
                placeholder="Acme Inc."
                className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue transition-colors duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => { setSlugEdited(true); setSlug(e.target.value) }}
                placeholder="acme-inc"
                className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder-white/30 font-mono focus:outline-none focus:border-neon-blue transition-colors duration-200"
              />
              {slug && (
                <p className="text-xs text-white/35">
                  Dashboard: <span className="font-mono text-white/70">/app/{slug}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !slug}
              className="w-full py-3 border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-sm overflow-hidden relative hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
              <span className="relative z-10">{isPending ? 'Creazione…' : 'Crea organizzazione'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
