// Translate messages/en.json -> it.json + es.json via OpenAI gpt-4o-mini.
//
// Idempotent: overwrites existing it/es. Run after edits to en.json.
//
// Usage: pnpm translate:i18n
// Cost: ~$0.02-0.05 per run
// Env required: OPENAI_API_KEY (in .env.local)

import { config } from 'dotenv'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import OpenAI from 'openai'

config({ path: '.env.local' })

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY in .env.local')
  process.exit(1)
}

const openai = new OpenAI({ apiKey })

const SOURCE_LANG = 'English'
const TARGET_LANGS = [
  { code: 'it', name: 'Italian' },
  { code: 'es', name: 'Spanish' },
] as const

const SYSTEM_PROMPT = `You are a professional product UX writer translating SaaS app strings.

Source language: ${SOURCE_LANG}
The product is "Lore" — a knowledge-grounded customer support platform.
Audience: tech-savvy founders, ops managers, support team leads.

Voice: professional but human, concise, never marketing-fluff, never overly formal.
Match the tone of products like Linear, Vercel, Notion, Stripe.

CRITICAL TRANSLATION RULES:
1. Preserve ALL placeholders exactly: {count}, {date}, etc.
2. Preserve ALL inline tags exactly: <playgroundLink>text</playgroundLink>, etc — translate ONLY the text between tags, keep the tag names unchanged.
3. Preserve product noun "Lore" untranslated.
3. Preserve technical nouns: API key, embed, snippet, slug, RAG, PDF, Markdown, Playground.
4. Preserve UI affordance words consistently (e.g. always "Annulla" for Cancel in Italian, not sometimes "Cancellare").
5. Match length: short labels stay short. No padding.
6. Ellipsis: use real ellipsis character … not three dots.
7. Apostrophes: smart quotes only when natural in the target language.
8. The output MUST be valid JSON matching the EXACT structure of input.
9. Keys are NEVER translated. Only string values.
10. Return ONLY the JSON object, no markdown fences, no commentary.`

type Bundle = { [key: string]: string | Bundle }

async function translateBundle(bundle: Bundle, targetLang: string): Promise<Bundle> {
  const userPrompt = `Translate this JSON to ${targetLang}. Return the same JSON structure with translated string values:

${JSON.stringify(bundle, null, 2)}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini-2024-07-18',
    response_format: { type: 'json_object' },
    temperature: 0,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty translation response')

  return JSON.parse(content) as Bundle
}

async function main() {
  const srcPath = join(process.cwd(), 'messages/en.json')
  const srcRaw = readFileSync(srcPath, 'utf-8')
  const source = JSON.parse(srcRaw) as Bundle

  console.log(`Source: messages/en.json (${Object.keys(source).length} top-level sections)`)
  console.log(`Target languages: ${TARGET_LANGS.map((l) => l.code).join(', ')}`)
  console.log()

  for (const { code, name } of TARGET_LANGS) {
    process.stdout.write(`  translating -> ${code} (${name})... `)

    const start = Date.now()
    try {
      const translated = await translateBundle(source, name)
      const outPath = join(process.cwd(), `messages/${code}.json`)
      writeFileSync(outPath, JSON.stringify(translated, null, 2) + '\n', 'utf-8')

      const elapsed = ((Date.now() - start) / 1000).toFixed(1)
      console.log(`OK ${elapsed}s`)
    } catch (err) {
      console.log(`FAIL`)
      console.error(`    ${err instanceof Error ? err.message : err}`)
      process.exit(1)
    }
  }

  console.log()
  console.log('All translations written. Verify it.json + es.json before committing.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
