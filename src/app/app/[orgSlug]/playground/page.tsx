import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlaygroundChat from '@/components/chat/PlaygroundChat'
import { getTranslations } from 'next-intl/server'

type OrgRow = { id: string }

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .limit(1)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
  if (!org) notFound()

  const { count } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', org.id)
    .eq('status', 'ready')

  const hasDocuments = (count ?? 0) > 0
  const t = await getTranslations('playground')

  return (
    <div className="h-full flex flex-col gap-4">
      <h1 className="font-bold text-white shrink-0" style={{ fontSize: 'var(--fs-page)' }}>
        {t('title')}<span className="text-neon-blue">.</span>
      </h1>
      <PlaygroundChat orgSlug={orgSlug} hasDocuments={hasDocuments} />
    </div>
  )
}
