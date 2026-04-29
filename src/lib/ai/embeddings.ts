import OpenAI from 'openai'
import { logger } from '@/lib/logger'

const BATCH_SIZE = 100

// lazy init — avoids module-level throw when OPENAI_API_KEY is absent at build time
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const openai = getClient()
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    })
    logger.info(`embeddings batch ${i / BATCH_SIZE + 1}: ${response.usage.total_tokens} tokens`)
    results.push(...response.data.map((d) => d.embedding))
  }

  return results
}
