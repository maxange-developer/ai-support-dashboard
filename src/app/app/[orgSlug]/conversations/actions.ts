'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { MessageRow } from '@/lib/db/analytics'
import { MOCK_CONVERSATIONS } from '@/lib/mock'

type MembershipRow = { org_id: string }
type OrgRow = { id: string }
type ConvRow = { id: string }

export async function getConversationMessages(
  orgSlug: string,
  convId: string,
): Promise<MessageRow[]> {
  const isMockData = process.env.USE_MOCK_DATA === 'true'
  const cookieStore = await cookies()
  const hasBypass = cookieStore.get('mock_bypass')?.value === 'true'

  if (isMockData || hasBypass) {
    // bypass DB — read directly from the canonical mock module so the modal
    // never lags behind src/lib/mock/index.ts (the _mock shadow tables can
    // drift from the seed source).
    const conv = MOCK_CONVERSATIONS.find((c) => c.id === convId)
    if (!conv) return []
    const baseTime = new Date(conv.started_at).getTime()
    return conv.messages.map((m, i) => ({
      id: `${conv.id}-msg-${i}`,
      role: m.role,
      content: m.content,
      sources: null,
      tokens_used: m.tokens_used,
      cost_cents: m.cost_cents,
      // space messages ~10s apart so the timeline reads naturally
      created_at: new Date(baseTime + i * 10000).toISOString(),
    }))
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: memberRows } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .returns<MembershipRow[]>()

  const orgIds = memberRows?.map((m) => m.org_id) ?? []
  if (!orgIds.length) return []

  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .in('id', orgIds)
    .returns<OrgRow[]>()

  const orgId = orgRows?.[0]?.id
  if (!orgId) return []

  const admin = createAdminClient()

  const { data: convRows } = await admin
    .from('conversations')
    .select('id')
    .eq('id', convId)
    .eq('org_id', orgId)
    .limit(1)
    .returns<ConvRow[]>()

  if (!convRows?.length) return []

  const { data, error } = await admin
    .from('messages')
    .select('id, role, content, sources, tokens_used, cost_cents, created_at')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })

  if (error) return []
  return (data as MessageRow[] | null) ?? []
}
