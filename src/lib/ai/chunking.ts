export interface Chunk {
  content: string
  chunkIndex: number
}

// 1 token ≈ 4 chars; default: 512 tokens = 2048 chars, overlap 50 tokens = 200 chars
export function chunkText(content: string, chunkSize = 512, overlap = 50): Chunk[] {
  const charSize = chunkSize * 4
  const charOverlap = overlap * 4
  const step = charSize - charOverlap
  const chunks: Chunk[] = []

  let start = 0
  let index = 0

  while (start < content.length) {
    const end = Math.min(start + charSize, content.length)
    const text = content.slice(start, end).trim()
    if (text.length > 0) {
      chunks.push({ content: text, chunkIndex: index++ })
    }
    if (end === content.length) break
    start += step
  }

  return chunks
}
