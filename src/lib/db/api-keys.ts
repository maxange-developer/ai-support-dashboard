import { createHash, randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { MOCK_API_KEYS } from '@/lib/mock'

const USE_MOCK = process.env.USE_MOCK_DATA === 'true'
const KEYS_TABLE = USE_MOCK ? 'api_keys_mock' : 'api_keys'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

export interface ApiKeyListItem {
  id: string
  org_id: string
  name: string | null
  key_prefix: string
  last_used_at: string | null
  created_at: string
}

function hash(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

// service role — bypasses RLS
export async function createApiKey(
  admin: SupabaseClient,
  orgId: string,
  name: string,
): Promise<{ rawKey: string; id: string }> {
  const rawKey = randomUUID()

  const { data, error } = await admin
    .from(KEYS_TABLE)
    .insert({ org_id: orgId, name, key_hash: hash(rawKey) })
    .select('id')
    .single()

  if (error) throw new Error(`createApiKey: ${error.message}`)
  return { rawKey, id: (data as { id: string }).id }
}

// service role — explicit org_id filter since RLS is not enabled on api_keys
export async function listApiKeys(
  admin: SupabaseClient,
  orgId: string,
): Promise<ApiKeyListItem[]> {
  if (USE_MOCK) {
    // bypass DB — _mock shadow tables can drift from the canonical mock module
    return MOCK_API_KEYS
      .filter((k) => k.org_id === orgId)
      .map((k, i) => ({
        id: k.id,
        org_id: k.org_id,
        name: k.name,
        key_prefix: k.key_prefix,
        // first key (production): created 30d ago, last used 2h ago
        // second key (staging): created 7d ago, never used
        created_at: new Date(Date.now() - (i === 0 ? 30 : 7) * DAY_MS).toISOString(),
        last_used_at: i === 0 ? new Date(Date.now() - 2 * HOUR_MS).toISOString() : null,
      }))
  }

  type RealRow = Omit<ApiKeyListItem, 'key_prefix'>
  const { data, error } = await admin
    .from(KEYS_TABLE)
    .select('id, org_id, name, last_used_at, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .returns<RealRow[]>()

  if (error) throw new Error(`listApiKeys: ${error.message}`)
  // Real keys: plaintext is never stored, so we synthesize a stable display
  // prefix from the key id. Newly-created keys show the real rawKey prefix
  // optimistically via the demo provider until the page is refreshed.
  return (data ?? []).map((k) => ({ ...k, key_prefix: `sk-${k.id.slice(0, 8)}` }))
}

// service role — org_id guard prevents cross-org deletion
export async function deleteApiKey(
  admin: SupabaseClient,
  id: string,
  orgId: string,
): Promise<void> {
  const { error } = await admin
    .from(KEYS_TABLE)
    .delete()
    .eq('id', id)
    .eq('org_id', orgId)

  if (error) throw new Error(`deleteApiKey: ${error.message}`)
}

// Used by route handlers to authenticate incoming API key requests
export async function validateApiKey(
  admin: SupabaseClient,
  rawKey: string,
): Promise<{ orgId: string } | null> {
  const keyHash = hash(rawKey)

  const { data } = await admin
    .from(KEYS_TABLE)
    .select('org_id')
    .eq('key_hash', keyHash)
    .limit(1)
    .returns<Array<{ org_id: string }>>()

  const row = data?.[0]
  if (!row) return null

  // update last_used_at (best-effort, fire-and-forget)
  void admin
    .from(KEYS_TABLE)
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash)

  return { orgId: row.org_id }
}
