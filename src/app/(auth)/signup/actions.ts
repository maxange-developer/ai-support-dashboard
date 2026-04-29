'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignupSchema } from '@/lib/validations/auth'

type State = { error: string } | { pending: string } | null

export async function signupAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = SignupSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.nome },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    redirect('/onboarding')
  }

  return { pending: 'Controlla la tua email per confermare il tuo account.' }
}
