import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))

vi.mock('openai', () => ({
  // Must use a regular function (not arrow) so `new OpenAI()` works as a constructor
  default: vi.fn().mockImplementation(function () {
    return { embeddings: { create: mockCreate } }
  }),
}))

// logger uses console.info — silence it in tests
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { embedBatch } from '@/lib/ai/embeddings'

const FAKE_VEC = Array.from({ length: 1536 }, (_, i) => i * 0.001)

function makeResponse(n: number) {
  return {
    data: Array.from({ length: n }, () => ({ embedding: FAKE_VEC })),
    usage: { total_tokens: n * 5 },
  }
}

describe('embedBatch', () => {
  beforeEach(() => mockCreate.mockReset())

  it('returns [] without calling API for empty input', async () => {
    const result = await embedBatch([])
    expect(result).toEqual([])
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns one embedding for a single text', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse(1))
    const result = await embedBatch(['hello'])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(FAKE_VEC)
    expect(mockCreate).toHaveBeenCalledOnce()
  })

  it('splits >100 texts into two API calls', async () => {
    mockCreate
      .mockResolvedValueOnce(makeResponse(100))
      .mockResolvedValueOnce(makeResponse(1))
    const texts = Array.from({ length: 101 }, (_, i) => `text ${i}`)
    const result = await embedBatch(texts)
    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(101)
  })

  it('propagates API errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('rate_limit_exceeded'))
    await expect(embedBatch(['x'])).rejects.toThrow('rate_limit_exceeded')
  })
})
