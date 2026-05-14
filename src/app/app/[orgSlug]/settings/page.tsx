import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listApiKeys } from '@/lib/db/api-keys'
import { createKeyAction, deleteKeyAction } from '../embed/actions'
import ApiKeyManager from '@/components/embed/ApiKeyManager'
import { getTranslations } from 'next-intl/server'
import { isMockMode, DEMO_ORG, DEMO_USER_EMAIL } from '@/lib/auth/mock-bypass'

type OrgRow = { id: string; name: string; slug: string; plan: string }

const PLAN_CLS: Record<string, string> = {
  free: 'text-white/50 border border-white/20 bg-white/5',
  pro: 'text-white border border-neon-blue/40 bg-neon-blue/8',
  enterprise: 'text-neon-green border border-neon-green/40 bg-neon-green/8',
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const t = await getTranslations('settings')

  let org: OrgRow | undefined
  let userEmail = ''
  let isAdmin = false

  if (await isMockMode()) {
    org = { ...DEMO_ORG }
    userEmail = DEMO_USER_EMAIL
    isAdmin = true
  } else {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) notFound()

    const { data: memberRows } = await supabase
      .from('memberships')
      .select('org_id, role')
      .eq('user_id', user.id)
      .returns<{ org_id: string; role: string }[]>()

    const orgIds = memberRows?.map((m) => m.org_id) ?? []

    const { data: orgRows } = await supabase
      .from('organizations')
      .select('id, name, slug, plan')
      .eq('slug', orgSlug)
      .in('id', orgIds)
      .returns<OrgRow[]>()

    org = orgRows?.[0]
    if (!org) notFound()

    const membership = memberRows?.find((m) => m.org_id === org!.id)
    isAdmin = membership?.role === 'admin'
    userEmail = user.email ?? ''
  }

  if (!org) notFound()

  const keys = await listApiKeys(createAdminClient(), org.id)
  const boundCreate = createKeyAction.bind(null, orgSlug)
  const boundDelete = deleteKeyAction.bind(null, orgSlug)

  const planCls = PLAN_CLS[org.plan] ?? PLAN_CLS.free
  const planLabel = t(`plans.${org.plan}` as 'plans.free')
  const roleLabel = isAdmin ? t('roles.admin') : t('roles.member')

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {t('title')}<span className="text-neon-blue">.</span>
        </h1>
        <p className="text-sm text-white/60 mt-1">{t('subtitle')}</p>
      </div>

      <section className="glass p-6 border-2 border-white/10 hover:border-neon-blue/30 transition-colors duration-300 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">{t('organization.title')}</h2>
        <div className="space-y-3">
          <Row label={t('organization.name')}>
            <span className="text-base font-semibold text-white">{org.name}</span>
          </Row>
          <Row label={t('organization.slug')}>
            <span className="font-mono text-sm text-white/70">{org.slug}</span>
          </Row>
          <Row label={t('organization.plan')}>
            <span className={`px-2.5 py-1 text-xs font-medium ${planCls}`}>
              {planLabel}
            </span>
          </Row>
          <Row label={t('organization.role')}>
            <span className="text-sm text-white/70">{roleLabel}</span>
          </Row>
          <Row label={t('organization.account')}>
            <span className="text-sm text-white/70">{userEmail || '—'}</span>
          </Row>
        </div>
      </section>

      <section className="glass p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">{t('apiKeys.title')}</h2>
        <ApiKeyManager keys={keys} createAction={boundCreate} deleteAction={boundDelete} />
      </section>

      <section className="glass p-6 border-2 border-red-500/30 space-y-4">
        <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">{t('dangerZone.title')}</h2>
        <p className="text-sm text-white/40">{t('dangerZone.body')}</p>
        <button
          type="button"
          disabled
          title={t('dangerZone.disabledHint')}
          className="px-6 py-2.5 border-2 border-red-500 text-red-400 font-semibold uppercase tracking-wider text-sm overflow-hidden relative hover:text-black hover:bg-red-500 transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('dangerZone.deleteButton')}
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
