#!/usr/bin/env node
/**
 * Seed mock data for AI Support Dashboard UI/UX testing.
 *
 * Usage:
 *   pnpm tsx scripts/seed-mock.ts
 *
 * Idempotent: uses upsert — safe to run multiple times.
 * Env vars needed in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { MOCK_ORGS, MOCK_DOCUMENTS, MOCK_CONVERSATIONS, MOCK_API_KEYS } from '../src/lib/mock/index'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

async function main() {
  console.log('🌱 Seeding mock data…\n')

  // ── 1. Organizations ───────────────────────────────────────────────────────
  for (const org of MOCK_ORGS) {
    const { error } = await admin
      .from('organizations')
      .upsert({ id: org.id, name: org.name, slug: org.slug, plan: org.plan }, { onConflict: 'id' })

    if (error) console.warn(`  org upsert "${org.slug}": ${error.message}`)
    else console.log(`  ✓ org: ${org.slug} (${org.plan})`)
  }

  // ── 2. Documents ──────────────────────────────────────────────────────────
  let docCount = 0
  for (const doc of MOCK_DOCUMENTS) {
    const { error } = await admin.from('documents').upsert(
      {
        id: doc.id,
        org_id: doc.org_id,
        title: doc.title,
        content: doc.content,
        source_type: doc.source_type,
        status: doc.status,
      },
      { onConflict: 'id' },
    )

    if (error) console.warn(`  doc upsert "${doc.title}": ${error.message}`)
    else { docCount++; console.log(`  ✓ doc: ${doc.title}`) }
  }

  // ── 3. Conversations + Messages ───────────────────────────────────────────
  let convCount = 0
  let msgCount = 0

  for (const conv of MOCK_CONVERSATIONS) {
    const startedAt = new Date(
      Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    ).toISOString()

    const { error: convErr } = await admin.from('conversations').upsert(
      { id: conv.id, org_id: conv.org_id, visitor_id: conv.visitor_id, started_at: startedAt },
      { onConflict: 'id' },
    )

    if (convErr) {
      console.warn(`  conv upsert ${conv.id}: ${convErr.message}`)
      continue
    }
    convCount++

    // Delete existing messages for idempotency, then re-insert
    await admin.from('messages').delete().eq('conversation_id', conv.id)

    for (const msg of conv.messages) {
      const { error: msgErr } = await admin.from('messages').insert({
        conversation_id: conv.id,
        role: msg.role,
        content: msg.content,
        tokens_used: msg.tokens_used,
        cost_cents: msg.cost_cents,
      })
      if (msgErr) console.warn(`  msg insert: ${msgErr.message}`)
      else msgCount++
    }
  }

  // ── 4. API Keys ───────────────────────────────────────────────────────────
  let keyCount = 0
  for (const key of MOCK_API_KEYS) {
    const { error } = await admin.from('api_keys').upsert(
      {
        id: key.id,
        org_id: key.org_id,
        name: key.name,
        key_hash: hashKey(key.plaintext),
      },
      { onConflict: 'id' },
    )

    if (error) console.warn(`  api_key upsert "${key.name}": ${error.message}`)
    else { keyCount++; console.log(`  ✓ api_key: ${key.name} (plaintext: ${key.plaintext})`) }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ Mock seed complete!')
  console.log(`   Orgs:          ${MOCK_ORGS.length}`)
  console.log(`   Documents:     ${docCount}/${MOCK_DOCUMENTS.length}`)
  console.log(`   Conversations: ${convCount}/${MOCK_CONVERSATIONS.length} (${msgCount} messages)`)
  console.log(`   API Keys:      ${keyCount}/${MOCK_API_KEYS.length}`)
  console.log('\nPlayground: /app/acme/playground')
  console.log('Use USE_MOCK_AI=true in .env.local to bypass real AI calls.\n')
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
