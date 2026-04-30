import { createHash, randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ApiKeyListItem {
  id: string
  org_id: string
  name: string | null
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
    .from('api_keys')
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
  const { data, error } = await admin
    .from('api_keys')
    .select('id, org_id, name, last_used_at, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .returns<ApiKeyListItem[]>()

  if (error) throw new Error(`listApiKeys: ${error.message}`)
  return data ?? []
}

// service role — org_id guard prevents cross-org deletion
export async function deleteApiKey(
  admin: SupabaseClient,
  id: string,
  orgId: string,
): Promise<void> {
  const { error } = await admin
    .from('api_keys')
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
    .from('api_keys')
    .select('org_id')
    .eq('key_hash', keyHash)
    .limit(1)
    .returns<Array<{ org_id: string }>>()

  const row = data?.[0]
  if (!row) return null

  // update last_used_at (best-effort, fire-and-forget)
  void admin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash)

  return { orgId: row.org_id }
}
