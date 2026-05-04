'use client'

import { useActionState, useState } from 'react'
import dynamic from 'next/dynamic'
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
        <div className="glass rounded-2xl border border-neon-blue/30 p-8 space-y-6 neon-border">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold neon-text">Crea organizzazione</h1>
            <p className="text-sm text-white/50">Potrai invitare altri membri in seguito.</p>
          </div>

          <form action={formAction} className="space-y-4">
            {state && 'error' in state && state.error && (
              <p className="text-sm text-red-400 text-center">{state.error}</p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Nome organizzazione
              </label>
              <input
                id="name"
                name="name"
                required
                onChange={handleNameChange}
                placeholder="Acme Inc."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-neon-blue focus:bg-neon-blue/5 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => { setSlugEdited(true); setSlug(e.target.value) }}
                placeholder="acme-inc"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 text-sm font-mono focus:outline-none focus:border-neon-blue focus:bg-neon-blue/5 transition-all duration-200"
              />
              {slug && (
                <p className="text-xs text-white/35">
                  Dashboard: <span className="font-mono text-neon-blue/70">/app/{slug}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !slug}
              className="w-full py-2.5 rounded-xl bg-neon-blue text-black font-bold text-sm hover:bg-neon-blue/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              {isPending ? 'Creazione…' : 'Crea organizzazione'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
