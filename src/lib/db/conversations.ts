import type { SupabaseClient } from '@supabase/supabase-js'

const CONV_TABLE = process.env.USE_MOCK_DATA === 'true' ? 'conversations_mock' : 'conversations'
const MSG_TABLE = process.env.USE_MOCK_DATA === 'true' ? 'messages_mock' : 'messages'

// service role — bypasses RLS (no INSERT policy on conversations/messages)
export async function createConversation(
  admin: SupabaseClient,
  orgId: string,
  visitorId?: string,
): Promise<string> {
  const { data, error } = await admin
    .from(CONV_TABLE)
    .insert({ org_id: orgId, visitor_id: visitorId ?? null })
    .select('id')
    .single()

  if (error) throw new Error(`createConversation: ${error.message}`)
  return (data as { id: string }).id
}

interface InsertMessageParams {
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  sources?: unknown
  tokensUsed?: number
  costCents?: number
}

// service role — bypasses RLS
export async function insertMessage(
  admin: SupabaseClient,
  { conversationId, role, content, sources, tokensUsed, costCents }: InsertMessageParams,
): Promise<void> {
  const { error } = await admin.from(MSG_TABLE).insert({
    conversation_id: conversationId,
    role,
    content,
    sources: sources ?? null,
    tokens_used: tokensUsed ?? null,
    cost_cents: costCents ?? null,
  })

  if (error) throw new Error(`insertMessage: ${error.message}`)
}
