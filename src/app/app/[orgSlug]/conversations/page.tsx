import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listConversations } from '@/lib/db/analytics'
import { getConversationMessages } from './actions'
import ConversationList from '@/components/conversations/ConversationList'
import { getTranslations } from 'next-intl/server'

type OrgRow = { id: string }

export default async function ConversationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ period?: string }>
}) {
  const { orgSlug } = await params
  const { period = '7d' } = await searchParams

  const supabase = await createClient()

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .limit(1)
    .returns<OrgRow[]>()

  const org = orgRows?.[0]
  if (!org) notFound()

  const admin = createAdminClient()
  const t = await getTranslations('conversations')

  let since: Date | undefined
  if (period === 'today') {
    since = new Date()
    since.setHours(0, 0, 0, 0)
  } else if (period === '7d') {
    since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  } else if (period === '30d') {
    since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }

  const conversations = await listConversations(admin, org.id, since)
  const boundGetMessages = getConversationMessages.bind(null, orgSlug)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-bold text-white" style={{ fontSize: 'var(--fs-page)' }}>
          {t('title')}<span className="text-neon-blue">.</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} in the period
        </p>
      </div>
      <ConversationList
        conversations={conversations}
        period={period}
        orgSlug={orgSlug}
        getMessages={boundGetMessages}
      />
    </div>
  )
}
