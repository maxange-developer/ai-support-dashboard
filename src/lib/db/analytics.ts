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
  { content: 'How do I track custom events?', count: 14 },
  { content: "What's the difference between Pro and Enterprise?", count: 11 },
  { content: 'How does your refund policy work?', count: 9 },
  { content: 'Is SSO available on Pro plan?', count: 7 },
  { content: 'Can I export raw event data?', count: 6 },
  { content: 'Do you support GDPR data deletion requests?', count: 5 },
  { content: 'How long does ingestion take after sending?', count: 4 },
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
    { id: '00000000-0000-0000-0002-000000000001', visitorId: 'visitor-2a91', startedAt: new Date(Date.now() - 2 * 3600000).toISOString(), messageCount: 4, costCents: 3 },
    { id: '00000000-0000-0000-0002-000000000002', visitorId: 'visitor-7c43', startedAt: new Date(Date.now() - 4 * 3600000).toISOString(), messageCount: 2, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000003', visitorId: 'visitor-94e1', startedAt: new Date(Date.now() - 6 * 3600000).toISOString(), messageCount: 2, costCents: 1 },
    { id: '00000000-0000-0000-0002-000000000004', visitorId: 'visitor-1f0d', startedAt: new Date(Date.now() - 8 * 3600000).toISOString(), messageCount: 4, costCents: 3 },
    { id: '00000000-0000-0000-0002-000000000005', visitorId: 'visitor-6b29', startedAt: new Date(Date.now() - 12 * 3600000).toISOString(), messageCount: 2, costCents: 1 },
    { id: '00000000-0000-0000-0002-000000000006', visitorId: 'visitor-ae84', startedAt: new Date(Date.now() - (86400000 + 2 * 3600000)).toISOString(), messageCount: 2, costCents: 1 },
    { id: '00000000-0000-0000-0002-000000000007', visitorId: 'visitor-3d52', startedAt: new Date(Date.now() - (86400000 + 5 * 3600000)).toISOString(), messageCount: 4, costCents: 4 },
    { id: '00000000-0000-0000-0002-000000000008', visitorId: 'visitor-c712', startedAt: new Date(Date.now() - (86400000 + 9 * 3600000)).toISOString(), messageCount: 2, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000009', visitorId: 'visitor-820f', startedAt: new Date(Date.now() - (86400000 + 14 * 3600000)).toISOString(), messageCount: 2, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000010', visitorId: 'visitor-5e3a', startedAt: new Date(Date.now() - (86400000 + 18 * 3600000)).toISOString(), messageCount: 4, costCents: 3 },
    { id: '00000000-0000-0000-0002-000000000011', visitorId: 'visitor-0b76', startedAt: new Date(Date.now() - (2 * 86400000 + 3 * 3600000)).toISOString(), messageCount: 2, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000012', visitorId: 'visitor-fa18', startedAt: new Date(Date.now() - (2 * 86400000 + 11 * 3600000)).toISOString(), messageCount: 6, costCents: 4 },
    { id: '00000000-0000-0000-0002-000000000013', visitorId: 'visitor-7e02', startedAt: new Date(Date.now() - (3 * 86400000 + 4 * 3600000)).toISOString(), messageCount: 2, costCents: 1 },
    { id: '00000000-0000-0000-0002-000000000014', visitorId: 'visitor-19bc', startedAt: new Date(Date.now() - (3 * 86400000 + 16 * 3600000)).toISOString(), messageCount: 2, costCents: 1 },
    { id: '00000000-0000-0000-0002-000000000015', visitorId: 'visitor-d6a3', startedAt: new Date(Date.now() - (4 * 86400000 + 7 * 3600000)).toISOString(), messageCount: 2, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000016', visitorId: 'visitor-83ef', startedAt: new Date(Date.now() - (5 * 86400000 + 9 * 3600000)).toISOString(), messageCount: 2, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000017', visitorId: 'visitor-2d4b', startedAt: new Date(Date.now() - (6 * 86400000 + 2 * 3600000)).toISOString(), messageCount: 2, costCents: 2 },
    { id: '00000000-0000-0000-0002-000000000018', visitorId: 'visitor-bf91', startedAt: new Date(Date.now() - (6 * 86400000 + 15 * 3600000)).toISOString(), messageCount: 4, costCents: 4 },
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
