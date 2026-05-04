import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

type OrgRow = { id: string; name: string; slug: string }
type MembershipRow = { org_id: string }

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: membershipData } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .returns<MembershipRow[]>()

  const orgIds = membershipData?.map((m) => m.org_id) ?? []
  if (orgIds.length === 0) notFound()

  const { data: orgData } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .in('id', orgIds)
    .returns<OrgRow[]>()

  const org = orgData?.[0]
  if (!org) notFound()

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar orgSlug={org.slug} orgName={org.name} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header orgSlug={org.slug} orgName={org.name} userEmail={user.email ?? ''} />
        <main className="flex-1 overflow-y-auto scrollbar-hide p-6">{children}</main>
      </div>
    </div>
  )
}
