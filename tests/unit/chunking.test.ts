import { describe, it, expect } from 'vitest'
import { chunkText } from '@/lib/ai/chunking'

// charSize = 512 * 4 = 2048, charOverlap = 50 * 4 = 200, step = 1848

describe('chunkText', () => {
  it('returns [] for empty string', () => {
    expect(chunkText('')).toEqual([])
  })

  it('returns [] for whitespace-only string', () => {
    expect(chunkText('   \n\t  ')).toEqual([])
  })

  it('returns single chunk for text shorter than chunk size', () => {
    const text = 'Hello, world!'
    const chunks = chunkText(text)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].content).toBe(text)
    expect(chunks[0].chunkIndex).toBe(0)
  })

  it('each chunk content is ≤ 2048 chars on long text', () => {
    const text = 'x'.repeat(10_000)
    const chunks = chunkText(text)
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(2048)
    }
  })

  it('adjacent chunks overlap by 200 chars', () => {
    // 2049 chars forces exactly 2 chunks
    const text = 'a'.repeat(2049)
    const chunks = chunkText(text)
    expect(chunks).toHaveLength(2)
    const tail = chunks[0].content.slice(-200)
    const head = chunks[1].content.slice(0, 200)
    expect(tail).toBe(head)
  })

  it('assigns sequential chunkIndex values', () => {
    const text = 'b'.repeat(6000)
    const chunks = chunkText(text)
    chunks.forEach((c, i) => expect(c.chunkIndex).toBe(i))
  })
})
