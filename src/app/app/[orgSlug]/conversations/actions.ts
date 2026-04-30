'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { MessageRow } from '@/lib/db/analytics'

type MembershipRow = { org_id: string }
type OrgRow = { id: string }
type ConvRow = { id: string }

export async function getConversationMessages(
  orgSlug: string,
  convId: string,
): Promise<MessageRow[]> {
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

  // Verify the conversation belongs to this org before fetching messages
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
    .order('created_at')

  if (error) return []

  return (data as MessageRow[] | null) ?? []
}
