import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import type { WorkspaceOption } from '@/components/dashboard/WorkspaceSwitcher'
import { DemoStateProvider } from '@/lib/demo-state/DemoStateProvider'
import {
  isMockMode,
  getDemoOrg,
  DEMO_ORGS_BY_SLUG,
  DEMO_USER_EMAIL,
} from '@/lib/auth/mock-bypass'

type OrgRow = { id: string; name: string; slug: string; plan: string | null }
type MembershipRow = { org_id: string }

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params

  if (await isMockMode()) {
    const org = getDemoOrg(orgSlug)
    if (!org) notFound()
    const workspaces: WorkspaceOption[] = Object.values(DEMO_ORGS_BY_SLUG).map((o) => ({
      slug: o.slug,
      name: o.name,
      plan: o.plan,
    }))
    return (
      <div className="flex h-screen bg-black overflow-hidden">
        <Sidebar orgSlug={org.slug} orgName={org.name} workspaces={workspaces} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          <Header
            orgSlug={org.slug}
            orgName={org.name}
            userEmail={DEMO_USER_EMAIL}
            workspaces={workspaces}
          />
          <main className="flex-1 overflow-y-auto scrollbar-hide p-6">
            <DemoStateProvider>{children}</DemoStateProvider>
          </main>
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

  const { data: allOrgs } = await supabase
    .from('organizations')
    .select('id, name, slug, plan')
    .in('id', orgIds)
    .returns<OrgRow[]>()

  const org = allOrgs?.find((o) => o.slug === orgSlug)
  if (!org) notFound()

  const workspaces: WorkspaceOption[] = (allOrgs ?? []).map((o) => ({
    slug: o.slug,
    name: o.name,
    plan: o.plan ?? 'free',
  }))

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar orgSlug={org.slug} orgName={org.name} workspaces={workspaces} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header
          orgSlug={org.slug}
          orgName={org.name}
          userEmail={user.email ?? ''}
          workspaces={workspaces}
        />
        <main className="flex-1 overflow-y-auto scrollbar-hide p-6">{children}</main>
      </div>
    </div>
  )
}
