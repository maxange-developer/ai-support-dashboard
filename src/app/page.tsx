import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  type MembershipRow = { organizations: { slug: string } }
  const { data } = await supabase
    .from('memberships')
    .select('organizations!inner(slug)')
    .eq('user_id', user.id)
    .limit(1)
    .returns<MembershipRow[]>()

  const orgSlug = data?.[0]?.organizations?.slug
  redirect(orgSlug ? `/app/${orgSlug}` : '/onboarding')
}
