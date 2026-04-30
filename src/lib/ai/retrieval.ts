import { createAdminClient } from '@/lib/supabase/admin'

export interface RetrievalChunk {
  content: string
  documentId: string
  documentTitle: string
  chunkIndex: number
  similarity: number
}

type RpcRow = {
  content: string
  document_id: string
  document_title: string
  chunk_index: number
  similarity: number
}

// service role — bypasses RLS on chunks (API key-authenticated requests have no Supabase user session)
export async function similaritySearch(
  orgId: string,
  queryEmbedding: number[],
  topK = 5,
): Promise<RetrievalChunk[]> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('match_chunks', {
    p_org_id: orgId,
    p_query_embedding: queryEmbedding,
    p_top_k: topK,
  })

  if (error) throw new Error(`similaritySearch: ${error.message}`)

  // shape guaranteed by the match_chunks SQL function
  const rows = (data as RpcRow[] | null) ?? []
  return rows.map((row) => ({
    content: row.content,
    documentId: row.document_id,
    documentTitle: row.document_title,
    chunkIndex: row.chunk_index,
    similarity: row.similarity,
  }))
}
