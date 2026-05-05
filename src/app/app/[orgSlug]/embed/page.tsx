import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listApiKeys } from '@/lib/db/api-keys'
import { createKeyAction, deleteKeyAction } from './actions'
import ApiKeyManager from '@/components/embed/ApiKeyManager'
import EmbedSnippet from '@/components/embed/EmbedSnippet'
import { getTranslations } from 'next-intl/server'

type MembershipRow = { org_id: string }
type OrgRow = { id: string; slug: string }

export default async function EmbedPage({
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
    .select('org_id')
    .eq('user_id', user.id)
    .returns<MembershipRow[]>()

  const orgIds = memberRows?.map((m) => m.org_id) ?? []

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id, slug')
    .eq('slug', orgSlug)
    .in('id', orgIds)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
  if (!org) notFound()

  const keys = await listApiKeys(createAdminClient(), org.id)

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const snippet = `<script src="${appUrl}/api/embed/${orgSlug}/script.js?apiKey=YOUR_API_KEY"></script>`

  const boundCreate = createKeyAction.bind(null, orgSlug)
  const boundDelete = deleteKeyAction.bind(null, orgSlug)
  const t = await getTranslations('embed')

  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">
      <div>
        <h1 className="font-bold text-neon-blue" style={{ fontSize: 'var(--fs-page)' }}>
          {t('title')}<span className="text-neon-pink">.</span>
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Create an API key, copy the snippet, and paste it into your site.
        </p>
      </div>

      <section className="glass rounded-lg p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">API Keys</h2>
        <ApiKeyManager keys={keys} createAction={boundCreate} deleteAction={boundDelete} />
      </section>

      <section className="glass rounded-lg p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Embed Code</h2>
        <p className="text-sm text-white/40">
          Replace{' '}
          <code className="font-mono text-xs border border-neon-blue/30 bg-neon-blue/8 text-neon-blue px-1.5 py-0.5">
            YOUR_API_KEY
          </code>{' '}
          with the key created above.
        </p>
        <EmbedSnippet snippet={snippet} snippetHint={t('snippetHint')} copyLabel={t('copySnippet')} />
      </section>

      <section className="glass rounded-lg p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Widget Preview</h2>
        <div className="border border-white/10 overflow-hidden h-[500px]">
          <iframe
            src={`/widget/${orgSlug}`}
            className="w-full h-full"
            title="Chat widget preview"
          />
        </div>
      </section>
    </div>
  )
}
