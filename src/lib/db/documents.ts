import type { SupabaseClient } from '@supabase/supabase-js'
import type { SourceType } from '@/lib/ai/parsing'
import { MOCK_DOCUMENTS } from '@/lib/mock'

const USE_MOCK = process.env.USE_MOCK_DATA === 'true'
const DOCS_TABLE = USE_MOCK ? 'documents_mock' : 'documents'
const CHUNKS_TABLE = USE_MOCK ? 'chunks_mock' : 'chunks'

const DAY_MS = 24 * 60 * 60 * 1000

export interface DocumentListItem {
  id: string
  org_id: string
  title: string
  source_type: SourceType
  status: 'processing' | 'ready' | 'error'
  created_at: string
}

interface InsertDocumentPayload {
  org_id: string
  title: string
  content: string
  source_type: SourceType
}

interface InsertChunkPayload {
  document_id: string
  org_id: string
  content: string
  embedding: number[]
  chunk_index: number
}

// service role — bypasses RLS
export async function insertDocument(
  admin: SupabaseClient,
  payload: InsertDocumentPayload,
): Promise<string> {
  const { data, error } = await admin
    .from(DOCS_TABLE)
    .insert(payload)
    .select('id')
    .single()

  if (error) throw new Error(`insertDocument: ${error.message}`)
  return (data as { id: string }).id
}

// service role — bypasses RLS
export async function updateDocumentStatus(
  admin: SupabaseClient,
  id: string,
  status: 'ready' | 'error',
): Promise<void> {
  const { error } = await admin.from(DOCS_TABLE).update({ status }).eq('id', id)
  if (error) throw new Error(`updateDocumentStatus: ${error.message}`)
}

// service role — bypasses RLS
export async function insertChunks(
  admin: SupabaseClient,
  chunks: InsertChunkPayload[],
): Promise<void> {
  if (chunks.length === 0) return
  const { error } = await admin.from(CHUNKS_TABLE).insert(chunks)
  if (error) throw new Error(`insertChunks: ${error.message}`)
}

export async function getDocumentsByOrg(
  supabase: SupabaseClient,
  orgId: string,
): Promise<DocumentListItem[]> {
  if (USE_MOCK) {
    // bypass DB — _mock shadow tables can drift from the canonical mock module
    return MOCK_DOCUMENTS
      .filter((d) => d.org_id === orgId)
      .map((d, i) => ({
        id: d.id,
        org_id: d.org_id,
        title: d.title,
        source_type: d.source_type as SourceType,
        status: d.status,
        // descending dates: doc 0 = 5 days ago, doc 1 = 10 days ago, ...
        created_at: new Date(Date.now() - (i * 5 + 5) * DAY_MS).toISOString(),
      }))
  }

  const { data, error } = await supabase
    .from(DOCS_TABLE)
    .select('id, org_id, title, source_type, status, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .returns<DocumentListItem[]>()

  if (error) throw new Error(`getDocumentsByOrg: ${error.message}`)
  return data ?? []
}

// service role — deletes chunks first (FK constraint), then documents; org_id guard prevents cross-org deletion
export async function deleteDocumentsFromDB(
  admin: SupabaseClient,
  ids: string[],
  orgId: string,
): Promise<void> {
  if (ids.length === 0) return

  const { error: chunksError } = await admin
    .from(CHUNKS_TABLE)
    .delete()
    .in('document_id', ids)
    .eq('org_id', orgId)

  if (chunksError) throw new Error(`deleteDocumentsFromDB chunks: ${chunksError.message}`)

  const { error } = await admin
    .from(DOCS_TABLE)
    .delete()
    .in('id', ids)
    .eq('org_id', orgId)

  if (error) throw new Error(`deleteDocumentsFromDB: ${error.message}`)
}
