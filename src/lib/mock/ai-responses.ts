import type { StreamEvent } from '@/lib/ai/chat'

const RESPONSES: [RegExp, string][] = [
  [/rimborso|restituz/i, 'Hai diritto al rimborso completo entro 14 giorni dall\'acquisto. Vai su Impostazioni > Fatturazione > Richiedi rimborso nella dashboard. I rimborsi vengono processati in 5-7 giorni lavorativi. [2]'],
  [/prova|trial|free/i, 'La prova gratuita dura 14 giorni senza richiedere la carta di credito. Hai accesso a tutte le funzionalità Pro durante il periodo di prova. Registrati su app.acme.example/signup. [1]'],
  [/document|cari[coa]|upload/i, 'Per caricare documenti vai su Documenti nel menu laterale e clicca "Carica documento". Sono supportati PDF e Markdown fino a 10MB. L\'elaborazione richiede 1-3 minuti. [3]'],
  [/api.key|chiave|autent/i, 'Genera una API key da Impostazioni > API Keys > Nuova chiave. Assegna un nome e copia la chiave — viene mostrata una sola volta. Usala nell\'header Authorization: Bearer YOUR_KEY. [4]'],
  [/gdpr|privacy|dati|sicurezz/i, 'Acme Corp è conforme al GDPR e SOC 2 Type II. I dati sono cifrati con AES-256 a riposo e TLS 1.3 in transito. I tuoi documenti rimangono di tua proprietà. [1][5]'],
  [/integr|widget|sito/i, 'Puoi integrare Acme tramite il widget JavaScript (copia lo snippet da Widget > Personalizza) oppure via API REST usando l\'endpoint POST /chat con la tua API key. [3][4]'],
  [/termini|contratt|recesso/i, 'I Termini di Servizio permettono la cancellazione in qualsiasi momento. Per recedere vai su Impostazioni > Fatturazione. Il rimborso è garantito entro 14 giorni dall\'acquisto. [2][5]'],
  [/uptime|sla|disponib/i, 'Il piano Pro garantisce il 99.5% di uptime mensile. Il piano Enterprise offre il 99.9% con rimborso pro-rata in caso di violazione. Il piano Free non ha SLA. [5]'],
  [/pian|prezz|cost/i, 'Il piano Free include 3 agenti e 500 conversazioni/mese. Il piano Pro include agenti illimitati e conversazioni illimitate. Il piano Enterprise aggiunge SLA, SSO e supporto dedicato. [1]'],
  [/onboarding|inizia|config/i, 'Per iniziare: (1) Crea un\'organizzazione, (2) Carica i tuoi documenti, (3) Personalizza il widget, (4) Genera una API key, (5) Testa nel Playground. La guida completa è nel centro assistenza. [3]'],
]

const FALLBACK = 'Non ho questa informazione nella knowledge base. Per assistenza contatta support@acme.example o usa la chat live nella dashboard.'

function pickResponse(query: string): string {
  for (const [pattern, answer] of RESPONSES) {
    if (pattern.test(query)) return answer
  }
  return FALLBACK
}

function tokenize(text: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < text.length) {
    const spaceIdx = text.indexOf(' ', i + 1)
    const end = spaceIdx === -1 ? text.length : spaceIdx + 1
    tokens.push(text.slice(i, end))
    i = end
  }
  return tokens
}

export async function* mockChatResponse(query: string): AsyncGenerator<StreamEvent> {
  const fullText = pickResponse(query)
  const tokens = tokenize(fullText)

  const INPUT_TOKENS = 350
  const OUTPUT_TOKENS = tokens.length * 3

  for (const token of tokens) {
    await new Promise<void>((resolve) => setTimeout(resolve, 25))
    yield { type: 'token', text: token }
  }

  yield {
    type: 'done',
    usage: { input_tokens: INPUT_TOKENS, output_tokens: OUTPUT_TOKENS },
    stopReason: 'stop',
  }
}
