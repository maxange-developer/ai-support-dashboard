import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mockRpc })),
}))

import { similaritySearch } from '@/lib/ai/retrieval'

const FAKE_ROW = {
  content: 'The return policy is 30 days.',
  document_id: 'doc-abc',
  document_title: 'Return Policy',
  chunk_index: 2,
  similarity: 0.92,
}

const QUERY_VEC = Array.from({ length: 1536 }, () => 0)

describe('similaritySearch', () => {
  beforeEach(() => mockRpc.mockReset())

  it('maps RPC rows to RetrievalChunk[]', async () => {
    mockRpc.mockResolvedValueOnce({ data: [FAKE_ROW], error: null })
    const result = await similaritySearch('org-1', QUERY_VEC)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      content: FAKE_ROW.content,
      documentId: FAKE_ROW.document_id,
      documentTitle: FAKE_ROW.document_title,
      chunkIndex: FAKE_ROW.chunk_index,
      similarity: FAKE_ROW.similarity,
    })
  })

  it('returns [] when RPC data is null', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null })
    const result = await similaritySearch('org-1', QUERY_VEC)
    expect(result).toEqual([])
  })

  it('throws with "similaritySearch:" prefix on RPC error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'connection refused' } })
    await expect(similaritySearch('org-1', QUERY_VEC)).rejects.toThrow(
      'similaritySearch: connection refused',
    )
  })
})
