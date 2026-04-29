'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreateOrgSchema } from '@/lib/validations/organization'

type State = { error: string } | null

export async function createOrgAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = CreateOrgSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non autenticato' }

  // service role: RLS bypass per insert org+membership (user non ancora membro)
  const admin = createAdminClient()

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: parsed.data.name, slug: parsed.data.slug })
    .select('id, slug')
    .single()

  if (orgError) {
    if (orgError.code === '23505') return { error: 'Slug già in uso, scegline un altro' }
    return { error: 'Errore nella creazione dell\'organizzazione' }
  }

  const orgRow = org as { id: string; slug: string }

  const { error: memberError } = await admin
    .from('memberships')
    .insert({ user_id: user.id, org_id: orgRow.id, role: 'admin' })

  if (memberError) {
    await admin.from('organizations').delete().eq('id', orgRow.id)
    return { error: 'Errore nella creazione della membership' }
  }

  redirect(`/app/${orgRow.slug}`)
}
