'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignupSchema } from '@/lib/validations/auth'

type State = { errorCode: string } | { pendingCode: string } | null

export async function signupAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = SignupSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errorCode: 'loginGeneric' }
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
    return { errorCode: 'loginGeneric' }
  }

  if (data.session) {
    redirect('/onboarding')
  }

  return { pendingCode: 'confirmationSent' }
}
