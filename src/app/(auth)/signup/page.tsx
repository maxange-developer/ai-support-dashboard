'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from './actions'
import { createClient } from '@/lib/supabase/client'

type State = { error: string } | { pending: string } | null

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(signupAction, null)

  async function handleGoogleSignup() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (state && 'pending' in state) {
    return (
      <div className="glass rounded-lg border border-neon-blue/30 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full border-2 border-neon-blue flex items-center justify-center mx-auto">
          <span className="text-neon-blue text-lg">✓</span>
        </div>
        <p className="text-lg font-semibold neon-text">Controlla la tua email</p>
        <p className="text-sm text-white/50">{state.pending}</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-lg border border-neon-blue/30 p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-bold neon-text" style={{ fontSize: 'var(--fs-page)' }}>
          Crea account<span className="text-neon-pink">.</span>
        </h1>
        <p className="text-sm text-white/50">Inizia il tuo periodo di prova gratuito</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/20 bg-white/5 text-sm font-medium text-white hover:bg-white/10 hover:border-neon-blue/40 transition-all duration-200"
      >
        <GoogleIcon />
        Continua con Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-white/30">oppure</span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {state && 'error' in state && state.error && (
          <p className="text-sm text-red-400 text-center">{state.error}</p>
        )}

        {(['nome', 'email', 'password'] as const).map((field) => (
          <div key={field} className="space-y-1.5">
            <label htmlFor={field} className="text-xs font-medium text-white/60 uppercase tracking-wider">
              {field === 'nome' ? 'Nome' : field === 'email' ? 'Email' : 'Password'}
            </label>
            <input
              id={field}
              name={field}
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              autoComplete={field === 'nome' ? 'name' : field === 'email' ? 'email' : 'new-password'}
              required
              className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue transition-colors duration-200"
              placeholder={field === 'nome' ? 'Mario Rossi' : field === 'email' ? 'tu@esempio.it' : '••••••••'}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-sm overflow-hidden relative hover:text-black motion-reduce:hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
          <span className="relative z-10">{isPending ? 'Registrazione…' : 'Crea account'}</span>
        </button>
      </form>

      <p className="text-center text-sm text-white/40">
        Hai già un account?{' '}
        <Link href="/login" className="text-neon-blue hover:text-neon-blue/70 transition-colors">
          Accedi
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
