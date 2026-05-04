import OpenAI from 'openai'
import { logger } from '@/lib/logger'
import type { RetrievalChunk } from './retrieval'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type StreamEvent =
  | { type: 'token'; text: string }
  | { type: 'done'; usage: { input_tokens: number; output_tokens: number }; stopReason: string }

const MAX_CHUNKS = 3
const MAX_CHUNK_CHARS = 2000

// lazy init — avoids module-level throw when OPENAI_API_KEY is absent at build time
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function buildSystem(chunks: RetrievalChunk[], orgName: string): string {
  const context = chunks
    .slice(0, MAX_CHUNKS)
    .map((c, i) => `[${i + 1}] ${c.documentTitle}\n${c.content.slice(0, MAX_CHUNK_CHARS)}`)
    .join('\n---\n')

  return `Sei l'assistente di ${orgName}. Rispondi solo dal contesto. Se non presente: "Non ho questa informazione." Cita fonte con [N].\n\nCONTESTO:\n${context}`
}

export async function* streamChat(
  messages: ChatMessage[],
  chunks: RetrievalChunk[],
  orgName: string,
): AsyncGenerator<StreamEvent> {
  const stream = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 500,
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      { role: 'system', content: buildSystem(chunks, orgName) },
      ...messages,
    ],
  })

  let stopReason = 'stop'
  let usage = { input_tokens: 0, output_tokens: 0 }

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? ''
    if (text) yield { type: 'token', text }

    const finish = chunk.choices[0]?.finish_reason
    if (finish) stopReason = finish

    if (chunk.usage) {
      usage = {
        input_tokens: chunk.usage.prompt_tokens,
        output_tokens: chunk.usage.completion_tokens,
      }
    }
  }

  const cost = usage.input_tokens * 0.00000015 + usage.output_tokens * 0.0000006
  logger.info(`[AI cost] $${cost.toFixed(6)} (in=${usage.input_tokens} out=${usage.output_tokens})`)

  yield { type: 'done', usage, stopReason }
}
