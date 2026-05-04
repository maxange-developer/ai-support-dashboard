'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginSchema } from '@/lib/validations/auth'

type State = { error: string } | null

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email o password non corretti' }
  }

  // Root page handles org-slug routing; redirect there to avoid duplicating logic
  redirect('/')
}
