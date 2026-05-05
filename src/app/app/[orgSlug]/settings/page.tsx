import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listApiKeys } from '@/lib/db/api-keys'
import { createKeyAction, deleteKeyAction } from '../embed/actions'
import ApiKeyManager from '@/components/embed/ApiKeyManager'
import { getTranslations } from 'next-intl/server'

type MembershipRow = { org_id: string; role: string }
type OrgRow = { id: string; name: string; slug: string; plan: string }

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free: { label: 'Free', cls: 'text-white/50 border border-white/20 bg-white/5' },
  pro: { label: 'Pro', cls: 'text-neon-blue border border-neon-blue/40 bg-neon-blue/8' },
  enterprise: { label: 'Enterprise', cls: 'text-neon-green border border-neon-green/40 bg-neon-green/8' },
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: memberRows } = await supabase
    .from('memberships')
    .select('org_id, role')
    .eq('user_id', user.id)
    .returns<MembershipRow[]>()

  const orgIds = memberRows?.map((m) => m.org_id) ?? []

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id, name, slug, plan')
    .eq('slug', orgSlug)
    .in('id', orgIds)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
  if (!org) notFound()

  const membership = memberRows?.find((m) => m.org_id === org.id)
  const isAdmin = membership?.role === 'admin'

  const keys = await listApiKeys(createAdminClient(), org.id)
  const boundCreate = createKeyAction.bind(null, orgSlug)
  const boundDelete = deleteKeyAction.bind(null, orgSlug)
  const t = await getTranslations('settings')

  const badge = PLAN_BADGE[org.plan] ?? PLAN_BADGE.free

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-bold text-neon-blue" style={{ fontSize: 'var(--fs-page)' }}>
          {t('title')}<span className="text-neon-pink">.</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Manage your organization and API keys</p>
      </div>

      {/* Card 1 — Organization */}
      <section className="glass rounded-lg p-6 border-2 border-white/10 hover:border-neon-blue/30 transition-colors duration-300 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Organization</h2>
        <div className="space-y-3">
          <Row label="Name">
            <span className="text-base font-semibold text-white">{org.name}</span>
          </Row>
          <Row label="Slug">
            <span className="font-mono text-sm text-white/70">{org.slug}</span>
          </Row>
          <Row label="Plan">
            <span className={`px-2.5 py-1 text-xs font-medium ${badge.cls}`}>
              {badge.label}
            </span>
          </Row>
          <Row label="Role">
            <span className="text-sm text-white/70">{isAdmin ? 'Admin' : 'Member'}</span>
          </Row>
          <Row label="Account">
            <span className="text-sm text-white/70">{user.email ?? '—'}</span>
          </Row>
        </div>
      </section>

      {/* Card 2 — API Keys */}
      <section className="glass rounded-lg p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">API Keys</h2>
        <ApiKeyManager keys={keys} createAction={boundCreate} deleteAction={boundDelete} />
      </section>

      {/* Card 3 — Danger Zone */}
      <section className="glass rounded-lg p-6 border-2 border-red-500/30 space-y-4">
        <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Danger Zone</h2>
        <p className="text-sm text-white/40">
          Deleting the organization is irreversible and removes all documents, conversations, and API keys.
        </p>
        <button
          type="button"
          disabled
          className="px-6 py-2.5 border-2 border-red-500 text-red-400 font-semibold uppercase tracking-wider text-sm overflow-hidden relative hover:text-black hover:bg-red-500 transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Delete organization
        </button>
      </section>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</span>
      <div>{children}</div>
    </div>
  )
}
