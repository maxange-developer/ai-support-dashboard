'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginSchema } from '@/lib/validations/auth'

type State = { errorCode: string } | null

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errorCode: 'loginGeneric' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { errorCode: 'loginInvalid' }
  }

  redirect('/')
}
