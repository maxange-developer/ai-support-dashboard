import type { SupabaseClient } from '@supabase/supabase-js'

const USE_MOCK = process.env.USE_MOCK_DATA === 'true'

const MOCK_CONV_STATS: ConversationStats = { total: 42, today: 5, week: 18 }
const MOCK_COST_STATS: CostStats = {
  totalCents: 1240,
  avgPerConvCents: 30,
  daily: [
    { day: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), tokensUsed: 4200, costCents: 168 },
    { day: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10), tokensUsed: 3800, costCents: 152 },
    { day: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10), tokensUsed: 5100, costCents: 204 },
    { day: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), tokensUsed: 2900, costCents: 116 },
    { day: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), tokensUsed: 6300, costCents: 252 },
    { day: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), tokensUsed: 4700, costCents: 188 },
    { day: new Date(Date.now()).toISOString().slice(0, 10), tokensUsed: 4000, costCents: 160 },
  ],
}
const MOCK_TOP_QUESTIONS: TopQuestion[] = [
  { content: 'Come funziona il rimborso?', count: 12 },
  { content: 'Come integro la vostra API?', count: 9 },
  { content: 'Supportate SSO con Google?', count: 7 },
  { content: 'Posso esportare i dati?', count: 5 },
  { content: 'Qual è il piano gratuito?', count: 4 },
]

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
  if (USE_MOCK) return MOCK_CONV_STATS
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
  if (USE_MOCK) return MOCK_TOP_QUESTIONS.slice(0, limit)
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
  if (USE_MOCK) return MOCK_COST_STATS
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
  if (USE_MOCK) return 420
  const { data, error } = await admin.rpc('avg_response_time_ms', { p_org_id: orgId })
  if (error) throw new Error(`getAvgResponseTime: ${error.message}`)
  return Number(data ?? 0)
}

export async function listConversations(
  admin: SupabaseClient,
  orgId: string,
  since?: Date,
): Promise<ConversationListItem[]> {
  if (USE_MOCK) return [
    { id: '00000000-0000-0000-0002-000000000001', visitorId: 'vis_abc123', startedAt: new Date(Date.now() - 3600000).toISOString(), messageCount: 2, costCents: 4 },
    { id: '00000000-0000-0000-0002-000000000002', visitorId: 'vis_def456', startedAt: new Date(Date.now() - 10800000).toISOString(), messageCount: 2, costCents: 4 },
    { id: '00000000-0000-0000-0002-000000000003', visitorId: 'vis_ghi789', startedAt: new Date(Date.now() - 86400000).toISOString(), messageCount: 3, costCents: 6 },
    { id: '00000000-0000-0000-0002-000000000004', visitorId: null, startedAt: new Date(Date.now() - 172800000).toISOString(), messageCount: 1, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000005', visitorId: 'vis_jkl012', startedAt: new Date(Date.now() - 259200000).toISOString(), messageCount: 4, costCents: 8 },
  ].filter(c => !since || new Date(c.startedAt) >= since)
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
