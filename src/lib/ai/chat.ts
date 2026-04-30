import Anthropic from '@anthropic-ai/sdk'
import type { RetrievalChunk } from './retrieval'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type StreamEvent =
  | { type: 'token'; text: string }
  | { type: 'done'; usage: { input_tokens: number; output_tokens: number }; stopReason: string }

// lazy init — avoids module-level throw when ANTHROPIC_API_KEY is absent at build time
function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function buildSystem(chunks: RetrievalChunk[], orgName: string): string {
  const context = chunks
    .map((c, i) => `[${i + 1}] Documento: "${c.documentTitle}"\n${c.content}`)
    .join('\n\n---\n\n')

  return `Sei l'assistente virtuale di ${orgName}.
Rispondi SOLO usando le informazioni nel contesto fornito qui sotto.
Se la risposta non è presente nel contesto, di' esattamente: "Non ho questa informazione nella knowledge base."
Cita sempre la fonte usando il formato [N] dove N è il numero del documento nel contesto.

CONTESTO:
${context}`
}

export async function* streamChat(
  messages: ChatMessage[],
  chunks: RetrievalChunk[],
  orgName: string,
): AsyncGenerator<StreamEvent> {
  const stream = getClient().messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildSystem(chunks, orgName),
    messages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield { type: 'token', text: event.delta.text }
    }
  }

  const final = await stream.finalMessage()
  yield {
    type: 'done',
    usage: final.usage,
    stopReason: final.stop_reason ?? 'end_turn',
  }
}
