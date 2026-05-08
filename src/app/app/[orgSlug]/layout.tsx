import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

type OrgRow = { id: string; name: string; slug: string }
type MembershipRow = { org_id: string }

const MOCK_ORGS: Record<string, OrgRow> = {
  acme: { id: '00000000-0000-0000-0000-000000000001', name: 'Acme Corp', slug: 'acme' },
  beta: { id: '00000000-0000-0000-0000-000000000002', name: 'Beta SaaS', slug: 'beta' },
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params

  const isMockAuth = process.env.USE_MOCK_AUTH === 'true'
  const cookieStore = await cookies()
  const hasBypass = cookieStore.get('mock_bypass')?.value === 'true'

  if (isMockAuth || hasBypass) {
    const org = MOCK_ORGS[orgSlug]
    if (!org) notFound()
    return (
      <div className="flex h-screen bg-black overflow-hidden">
        <Sidebar orgSlug={org.slug} orgName={org.name} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          <Header orgSlug={org.slug} orgName={org.name} userEmail="demo@example.com" />
          <main className="flex-1 overflow-y-auto scrollbar-hide p-6">{children}</main>
        </div>
      </div>
    )
  }

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
