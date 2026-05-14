import type { StreamEvent } from '@/lib/ai/chat'

const MOCK_REPLIES = [
  'Based on the knowledge base, you can reset your password from Settings > Security. You\'ll receive an email confirmation within a few minutes.',
  'Our Pro plan supports unlimited agents and conversations. The Free plan is capped at 3 agents and 500 conversations per month.',
  'Yes, Lore is SOC 2 Type II certified and GDPR compliant. Audit reports are available under NDA upon request.',
  'Refunds are issued within 14 days of initial purchase, no questions asked. After 14 days they are reviewed case-by-case and prorated.',
  'You can integrate the chat widget by copying the one-line script tag from Embed > Install snippet and pasting it before your closing </body> tag.',
  'To upload documents, go to Knowledge Base in the sidebar and click "Add document". PDF, Markdown, and plain text files up to 10 MB are supported.',
  'API keys are generated in Settings > API Keys. Each key is shown only once — store it securely. Keys can be revoked at any time without downtime.',
]

function pickReply(query: string): string {
  // simple hash so the same query returns the same reply in a session
  let h = 0
  for (let i = 0; i < query.length; i++) h = (h * 31 + query.charCodeAt(i)) >>> 0
  return MOCK_REPLIES[h % MOCK_REPLIES.length]
}

export async function* mockChatResponse(query: string): AsyncGenerator<StreamEvent> {
  const fullText = pickReply(query)
  const words = fullText.split(' ')

  const INPUT_TOKENS = 350
  const OUTPUT_TOKENS = words.length * 3

  for (const word of words) {
    await new Promise<void>((resolve) => setTimeout(resolve, 35))
    yield { type: 'token', text: word + ' ' }
  }

  yield {
    type: 'done',
    usage: { input_tokens: INPUT_TOKENS, output_tokens: OUTPUT_TOKENS },
    stopReason: 'stop',
  }
}
