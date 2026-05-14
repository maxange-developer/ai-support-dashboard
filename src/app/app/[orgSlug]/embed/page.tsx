import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listApiKeys } from '@/lib/db/api-keys'
import { createKeyAction, deleteKeyAction } from './actions'
import ApiKeyManager from '@/components/embed/ApiKeyManager'
import EmbedSnippet from '@/components/embed/EmbedSnippet'
import { getTranslations } from 'next-intl/server'
import { isMockMode, getDemoOrg } from '@/lib/auth/mock-bypass'

type OrgRow = { id: string; slug: string }

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params

  let org: OrgRow | undefined

  if (await isMockMode()) {
    const demoOrg = getDemoOrg(orgSlug)
    if (!demoOrg) notFound()
    org = { id: demoOrg.id, slug: orgSlug }
  } else {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) notFound()

    const { data: memberRows } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .returns<{ org_id: string }[]>()

    const orgIds = memberRows?.map((m) => m.org_id) ?? []

    const { data: orgRows } = await supabase
      .from('organizations')
      .select('id, slug')
      .eq('slug', orgSlug)
      .in('id', orgIds)
      .returns<OrgRow[]>()

    org = orgRows?.[0]
  }

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
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {t('title')}<span className="text-neon-blue">.</span>
        </h1>
        <p className="text-sm text-white/60 mt-1">{t('subtitle')}</p>
      </div>

      <section className="glass p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">{t('apiKeysTitle')}</h2>
        <ApiKeyManager keys={keys} createAction={boundCreate} deleteAction={boundDelete} />
      </section>

      <section className="glass p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">{t('snippetTitle')}</h2>
        <p className="text-sm text-white/40">
          {t('snippetReplace')}{' '}
          <code className="font-mono text-xs border border-neon-blue/30 bg-neon-blue/8 text-white px-1.5 py-0.5">
            YOUR_API_KEY
          </code>{' '}
          {t('snippetReplaceSuffix')}
        </p>
        <EmbedSnippet snippet={snippet} snippetHint={t('snippetIntro')} copyLabel={t('copySnippet')} />
        <p className="text-xs text-white/30 mt-3">{t('demoNotice')}</p>
      </section>

      <section className="glass p-6 border-2 border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">{t('previewTitle')}</h2>
        <p className="text-xs italic text-white/40">{t('previewHint')}</p>
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
