import type { SupabaseClient } from '@supabase/supabase-js'
import { MOCK_CONVERSATIONS } from '@/lib/mock'

const USE_MOCK = process.env.USE_MOCK_DATA === 'true'

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

// Filter MOCK_CONVERSATIONS by org once per call; downstream mock paths derive
// stats from this slice so that switching workspaces shows org-specific data.
function mockConvsForOrg(orgId: string) {
  return MOCK_CONVERSATIONS.filter((c) => c.org_id === orgId)
}

export async function getConversationStats(
  admin: SupabaseClient,
  orgId: string,
): Promise<ConversationStats> {
  if (USE_MOCK) {
    const convs = mockConvsForOrg(orgId)
    const now = Date.now()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = now - 7 * 24 * 60 * 60 * 1000
    return {
      total: convs.length,
      today: convs.filter((c) => new Date(c.started_at).getTime() >= todayStart.getTime()).length,
      week: convs.filter((c) => new Date(c.started_at).getTime() >= weekStart).length,
    }
  }
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
  if (USE_MOCK) {
    // Derive top questions from this org's conversations: count duplicate user
    // messages, sort desc. Mirrors what the real top_questions RPC does.
    const counts = new Map<string, number>()
    for (const conv of mockConvsForOrg(orgId)) {
      for (const msg of conv.messages) {
        if (msg.role !== 'user') continue
        counts.set(msg.content, (counts.get(msg.content) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([content, count]) => ({ content, count }))
  }
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
  if (USE_MOCK) {
    // Bucket each conversation's messages by day, sum tokens + cents.
    type Bucket = { tokensUsed: number; costCents: number }
    const byDay = new Map<string, Bucket>()
    const convs = mockConvsForOrg(orgId)
    for (const conv of convs) {
      const day = conv.started_at.slice(0, 10)
      const bucket = byDay.get(day) ?? { tokensUsed: 0, costCents: 0 }
      for (const msg of conv.messages) {
        bucket.tokensUsed += msg.tokens_used ?? 0
        bucket.costCents += msg.cost_cents ?? 0
      }
      byDay.set(day, bucket)
    }
    // Fill the last 7 days so the chart always renders a continuous line.
    const daily: DailyCost[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const bucket = byDay.get(day) ?? { tokensUsed: 0, costCents: 0 }
      daily.push({ day, tokensUsed: bucket.tokensUsed, costCents: bucket.costCents })
    }
    const totalCents = daily.reduce((acc, d) => acc + d.costCents, 0)
    const avgPerConvCents = convs.length > 0 ? totalCents / convs.length : 0
    return { totalCents, avgPerConvCents, daily }
  }
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
  if (USE_MOCK) {
    return mockConvsForOrg(orgId)
      .map((c) => ({
        id: c.id,
        visitorId: c.visitor_id,
        startedAt: c.started_at,
        messageCount: c.messages.length,
        costCents: c.messages.reduce((acc, m) => acc + (m.cost_cents ?? 0), 0),
      }))
      .filter((c) => !since || new Date(c.startedAt) >= since)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  }
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
