import { type NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { embedBatch } from '@/lib/ai/embeddings'
import { similaritySearch } from '@/lib/ai/retrieval'
import { streamChat } from '@/lib/ai/chat'
import { mockChatResponse } from '@/lib/mock/ai-responses'
import { createConversation, insertMessage } from '@/lib/db/conversations'
import { logger } from '@/lib/logger'
import type { ChatMessage } from '@/lib/ai/chat'
import type { RetrievalChunk } from '@/lib/ai/retrieval'

// in-memory rate limit — per-process; not distributed, sufficient for demo
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(orgId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(orgId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(orgId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

function isValidBody(
  b: unknown,
): b is { orgSlug: string; message: string; conversationId?: string; apiKey?: string } {
  if (typeof b !== 'object' || b === null) return false
  const o = b as Record<string, unknown>
  return typeof o.orgSlug === 'string' && typeof o.message === 'string'
}

type OrgRow = { id: string; name: string; slug: string }
type ApiKeyRow = { org_id: string }
type MembershipRow = { org_id: string }

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { orgSlug, message, conversationId, apiKey } = body
  const admin = createAdminClient()

  // 1. Auth: API key hash OR session cookie (playground)
  let orgId: string
  let orgName: string

  if (apiKey) {
    const hash = hashKey(apiKey)

    const { data: keyRows } = await admin
      .from('api_keys')
      .select('org_id')
      .eq('key_hash', hash)
      .limit(1)
      .returns<ApiKeyRow[]>()

    const keyRow = keyRows?.[0]
    if (!keyRow) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

    const { data: orgRows } = await admin
      .from('organizations')
      .select('id, name, slug')
      .eq('id', keyRow.org_id)
      .limit(1)
      .returns<OrgRow[]>()

    const org = orgRows?.[0]
    if (!org || org.slug !== orgSlug) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    orgId = org.id
    orgName = org.name

    // update last_used_at (best-effort, fire-and-forget)
    void admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', hash)
  } else {
    // session-based path for playground (reads Supabase session cookie)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: orgRows } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('slug', orgSlug)
      .limit(1)
      .returns<OrgRow[]>()

    const org = orgRows?.[0]
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: memberRows } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .eq('org_id', org.id)
      .limit(1)
      .returns<MembershipRow[]>()

    if (!memberRows?.length) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    orgId = org.id
    orgName = org.name
  }

  // 2. Rate limit
  if (!checkRateLimit(orgId)) {
    return NextResponse.json({ error: 'Rate limit exceeded (max 10 req/min)' }, { status: 429 })
  }

  // 3. Embed message + similarity search (skipped when USE_MOCK_AI=true)
  let chunks: RetrievalChunk[]
  if (process.env.USE_MOCK_AI === 'true') {
    chunks = []
  } else {
    try {
      const [queryEmbedding] = await embedBatch([message])
      chunks = await similaritySearch(orgId, queryEmbedding)
    } catch (err) {
      logger.error('retrieval failed', err)
      return NextResponse.json({ error: 'Retrieval failed' }, { status: 500 })
    }
  }

  // 4. Create or resume conversation
  let convId: string
  try {
    convId = conversationId ?? (await createConversation(admin, orgId))
  } catch (err) {
    logger.error('createConversation failed', err)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // 5. Persist user message
  insertMessage(admin, { conversationId: convId, role: 'user', content: message }).catch(
    (err) => logger.error('insertMessage(user) failed', err),
  )

  // single-turn for now; conversation history would be fetched here in a future iteration
  const chatMessages: ChatMessage[] = [{ role: 'user', content: message }]
  const sources = chunks.map((c) => ({
    documentId: c.documentId,
    documentTitle: c.documentTitle,
    similarity: c.similarity,
  }))

  // 6. Stream SSE response
  const encoder = new TextEncoder()
  let fullText = ''

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const chatGenerator =
          process.env.USE_MOCK_AI === 'true'
            ? mockChatResponse(message)
            : streamChat(chatMessages, chunks, orgName)

        for await (const event of chatGenerator) {
          if (event.type === 'token') {
            fullText += event.text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'token', text: event.text })}\n\n`),
            )
          } else if (event.type === 'done') {
            // gpt-4o-mini: $0.15/MTok input, $0.60/MTok output
            const costCents = Math.round(
              (event.usage.input_tokens * 15 + event.usage.output_tokens * 60) / 1_000_000,
            )
            const tokensUsed = event.usage.input_tokens + event.usage.output_tokens

            // 7. Persist assistant message (best-effort, must not delay stream close)
            insertMessage(admin, {
              conversationId: convId,
              role: 'assistant',
              content: fullText,
              sources,
              tokensUsed,
              costCents,
            }).catch((err) => logger.error('insertMessage(assistant) failed', err))

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'done', sources, tokensUsed, conversationId: convId })}\n\n`,
              ),
            )
          }
        }
      } catch (err) {
        logger.error('streamChat failed', err)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', error: 'Stream error' })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
