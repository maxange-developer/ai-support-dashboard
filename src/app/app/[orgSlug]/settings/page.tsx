import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listApiKeys } from '@/lib/db/api-keys'
import { createKeyAction, deleteKeyAction } from '../embed/actions'
import ApiKeyManager from '@/components/embed/ApiKeyManager'
import { Shield, Building2, Key, AlertTriangle } from 'lucide-react'

type MembershipRow = { org_id: string; role: string }
type OrgRow = { id: string; name: string; slug: string; plan: string }

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

  const planLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-bold neon-text" style={{ fontSize: 'var(--fs-page)' }}>
          Impostazioni
        </h1>
        <p className="text-white/40 text-sm mt-1">Gestisci la tua organizzazione e le chiavi API</p>
      </div>

      {/* Organization */}
      <section className="glass rounded-xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={15} className="text-neon-blue/70" aria-hidden />
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Organizzazione</h2>
        </div>
        <div className="space-y-3">
          <Row label="Nome" value={org.name} />
          <Row label="Slug" value={org.slug} mono />
          <Row
            label="Piano"
            value={
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                org.plan === 'pro'
                  ? 'text-neon-blue border-neon-blue/40 bg-neon-blue/8'
                  : org.plan === 'enterprise'
                  ? 'text-neon-pink border-neon-pink/40 bg-neon-pink/8'
                  : 'text-white/50 border-white/20 bg-white/5'
              }`}>
                {planLabel[org.plan] ?? org.plan}
              </span>
            }
          />
          <Row label="Ruolo" value={isAdmin ? 'Admin' : 'Membro'} />
          <Row label="Account" value={user.email ?? '—'} />
        </div>
      </section>

      {/* API Keys */}
      <section className="glass rounded-xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Key size={15} className="text-neon-blue/70" aria-hidden />
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Chiavi API</h2>
        </div>
        <ApiKeyManager keys={keys} createAction={boundCreate} deleteAction={boundDelete} />
      </section>

      {/* Security */}
      <section className="glass rounded-xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-neon-blue/70" aria-hidden />
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Sicurezza</h2>
        </div>
        <p className="text-sm text-white/40">
          Le richieste al widget sono limitate a 10 al minuto per organizzazione. Le chiavi API sono hashed con SHA-256 e non vengono mai memorizzate in chiaro.
        </p>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-500/30 bg-red-500/4 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-400" aria-hidden />
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Zona pericolosa</h2>
        </div>
        <p className="text-sm text-white/40">
          Per eliminare l'organizzazione contatta il supporto. Questa operazione è irreversibile e cancella tutti i documenti, le conversazioni e le chiavi API.
        </p>
      </section>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</span>
      <span className={`text-sm text-white/80 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
