import type { SupabaseClient } from '@supabase/supabase-js'

// service role — bypasses RLS (no INSERT policy on conversations/messages)
export async function createConversation(
  admin: SupabaseClient,
  orgId: string,
  visitorId?: string,
): Promise<string> {
  const { data, error } = await admin
    .from('conversations')
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
  const { error } = await admin.from('messages').insert({
    conversation_id: conversationId,
    role,
    content,
    sources: sources ?? null,
    tokens_used: tokensUsed ?? null,
    cost_cents: costCents ?? null,
  })

  if (error) throw new Error(`insertMessage: ${error.message}`)
}
