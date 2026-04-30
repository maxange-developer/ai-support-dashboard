import type { SupabaseClient } from '@supabase/supabase-js'

export interface ConversationStats {
  total: number
  today: number
  week: number
}

export interface TopQuestion {
  content: string
  count: number
}

export interface DailyCost {
  day: string
  tokensUsed: number
  costCents: number
}

export interface CostStats {
  totalCents: number
  avgPerConvCents: number
  daily: DailyCost[]
}

export interface ConversationListItem {
  id: string
  visitorId: string | null
  startedAt: string
  messageCount: number
  costCents: number
}

export interface MessageRow {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources: unknown
  tokens_used: number | null
  cost_cents: number | null
  created_at: string
}

// All functions use service role — conversations/messages have RLS with no SELECT policy

export async function getConversationStats(
  admin: SupabaseClient,
  orgId: string,
): Promise<ConversationStats> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [{ count: total }, { count: today }, { count: week }] = await Promise.all([
    admin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId),
    admin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('started_at', todayStart.toISOString()),
    admin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('started_at', weekStart.toISOString()),
  ])

  return { total: total ?? 0, today: today ?? 0, week: week ?? 0 }
}

export async function getTopQuestions(
  admin: SupabaseClient,
  orgId: string,
  limit = 10,
): Promise<TopQuestion[]> {
  type Row = { content: string; count: string }
  const { data, error } = await admin.rpc('top_questions', {
    p_org_id: orgId,
    p_limit: limit,
  })
  if (error) throw new Error(`getTopQuestions: ${error.message}`)
  return ((data as Row[] | null) ?? []).map((r) => ({
    content: r.content,
    count: Number(r.count),
  }))
}

export async function getCostStats(
  admin: SupabaseClient,
  orgId: string,
): Promise<CostStats> {
  type Row = { day: string; tokens_used: string; cost_cents: string }
  const [rpcResult, { count }] = await Promise.all([
    admin.rpc('daily_cost', { p_org_id: orgId }),
    admin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId),
  ])

  if (rpcResult.error) throw new Error(`getCostStats: ${rpcResult.error.message}`)

  const daily = ((rpcResult.data as Row[] | null) ?? []).map((r) => ({
    day: r.day,
    tokensUsed: Number(r.tokens_used),
    costCents: Number(r.cost_cents),
  }))

  const totalCents = daily.reduce((acc, d) => acc + d.costCents, 0)
  const convCount = count ?? 0
  const avgPerConvCents = convCount > 0 ? totalCents / convCount : 0

  return { totalCents, avgPerConvCents, daily }
}

export async function getAvgResponseTime(
  admin: SupabaseClient,
  orgId: string,
): Promise<number> {
  const { data, error } = await admin.rpc('avg_response_time_ms', { p_org_id: orgId })
  if (error) throw new Error(`getAvgResponseTime: ${error.message}`)
  return Number(data ?? 0)
}

export async function listConversations(
  admin: SupabaseClient,
  orgId: string,
  since?: Date,
): Promise<ConversationListItem[]> {
  type Row = {
    id: string
    visitor_id: string | null
    started_at: string
    message_count: string
    cost_cents: string
  }
  const { data, error } = await admin.rpc('conversation_list', {
    p_org_id: orgId,
    p_since: since?.toISOString() ?? null,
  })
  if (error) throw new Error(`listConversations: ${error.message}`)
  return ((data as Row[] | null) ?? []).map((r) => ({
    id: r.id,
    visitorId: r.visitor_id,
    startedAt: r.started_at,
    messageCount: Number(r.message_count),
    costCents: Number(r.cost_cents),
  }))
}
