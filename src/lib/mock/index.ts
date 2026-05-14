// Fixed UUIDs for idempotent seeding
export const MOCK_ORG_1 = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Acme Corp',
  slug: 'acme',
  plan: 'pro',
}

export const MOCK_ORG_2 = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Beta SaaS',
  slug: 'beta',
  plan: 'free',
}

export const MOCK_ORGS = [MOCK_ORG_1, MOCK_ORG_2]

export const MOCK_DOCUMENTS = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    org_id: MOCK_ORG_1.id,
    title: 'FAQ Prodotto',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# FAQ Prodotto Acme Corp

**1. Cos'è Acme Corp?**
Acme Corp è una piattaforma SaaS per la gestione del supporto clienti basata su intelligenza artificiale.

**2. Come inizia la prova gratuita?**
La prova gratuita dura 14 giorni, nessuna carta di credito richiesta. Registrati su app.acme.example/signup.

**3. Quali integrazioni sono supportate?**
Acme si integra con Slack, Intercom, Zendesk, HubSpot, Salesforce e oltre 50 altri strumenti via API REST.

**4. È possibile importare i ticket esistenti?**
Sì. Il wizard di migrazione supporta CSV, JSON e connessione diretta a Zendesk o Freshdesk.

**5. Acme funziona in italiano?**
Sì, l'interfaccia e il motore AI sono disponibili in italiano, inglese, spagnolo, francese e tedesco.

**6. Quanti agenti posso aggiungere?**
Il piano Pro include agenti illimitati. Il piano Free include fino a 3 agenti.

**7. Posso personalizzare il widget di chat?**
Sì. Colori, font, logo e posizione sono personalizzabili dal pannello Impostazioni > Widget.

**8. Come funziona l'AI?**
L'AI legge i tuoi documenti, li indicizza e risponde alle domande dei clienti in linguaggio naturale, citando sempre le fonti.

**9. I dati sono al sicuro?**
Sì. Utilizziamo crittografia AES-256 a riposo e TLS 1.3 in transito. Conformi a GDPR e SOC 2 Type II.

**10. Posso esportare i dati?**
Sì, esportazione completa in JSON o CSV disponibile in Impostazioni > Esporta dati.

**11. Esiste un'API pubblica?**
Sì. API REST documentata su docs.acme.example/api con autenticazione via API key.

**12. Come funziona il RAG?**
I documenti vengono vettorizzati con text-embedding-3-small. Le domande vengono confrontate con i chunk più simili usando pgvector.

**13. Che modelli AI usa Acme?**
Il modello predefinito è GPT-4o-mini per le risposte. Le embedding usano text-embedding-3-small.

**14. C'è un limite di messaggi al mese?**
Piano Free: 500 conversazioni/mese. Piano Pro: illimitato. Piano Enterprise: SLA dedicato.

**15. Come aggiungo un documento?**
Vai su Documenti > Carica e trascina un PDF o file Markdown. L'elaborazione richiede 1-3 minuti.

**16. Posso avere un webhook per gli eventi?**
Sì. I webhook sono configurabili in Impostazioni > Webhook per eventi come nuova conversazione, messaggio, errore.

**17. Acme supporta il multi-tenant?**
Sì. Ogni organizzazione ha il proprio spazio isolato con RLS a livello database.

**18. Come funziona il piano Enterprise?**
Enterprise include: SLA 99.9%, supporto dedicato, SSO SAML, audit log, IP allowlist e deployment on-premise opzionale.

**19. È disponibile un'app mobile?**
L'app mobile è prevista per Q3 2026. Attualmente la dashboard è responsive e funziona su browser mobile.

**20. Come contatto il supporto?**
Via chat nella dashboard (risposta entro 2h su Pro), email support@acme.example, o telefono dedicato per Enterprise.`,
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    org_id: MOCK_ORG_1.id,
    title: 'Policy Rimborsi',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Policy Rimborsi — Acme Corp

## Diritto al rimborso

I clienti con piano a pagamento hanno diritto al rimborso completo entro **14 giorni** dall'acquisto, senza necessità di fornire motivazioni (garanzia soddisfatti o rimborsati).

## Come richiedere un rimborso

1. Accedi alla dashboard su app.acme.example
2. Vai su Impostazioni > Fatturazione > Richiedi rimborso
3. Seleziona il periodo da rimborsare
4. Conferma la richiesta

Il rimborso viene processato entro **5-7 giorni lavorativi** sul metodo di pagamento originale.

## Eccezioni

- I piani annuali rimborsano solo i mesi non usufruiti (calcolo pro-rata)
- Le add-on (spazio storage aggiuntivo, agenti extra) non sono rimborsabili dopo l'attivazione
- Il piano Enterprise segue le condizioni negoziate nel contratto

## Rimborsi parziali

In caso di downgrade da piano superiore, viene emesso credito per la differenza pro-rata, applicato automaticamente alle fatture successive.

## Disdetta vs rimborso

La disdetta non genera automaticamente un rimborso. Per ricevere il rimborso è necessario presentare esplicita richiesta prima della disdetta.

## Contatti

Per assistenza sui rimborsi: billing@acme.example
Tempo di risposta: 24h (giorni lavorativi)`,
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    org_id: MOCK_ORG_1.id,
    title: 'Guida Onboarding',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Guida Onboarding — Acme Corp

## Benvenuto in Acme!

Questa guida ti accompagna nei primi passi per configurare il tuo assistente AI di supporto.

## Step 1 — Crea la tua organizzazione

Dopo la registrazione, crea la tua prima organizzazione:
1. Clicca "Nuova organizzazione"
2. Inserisci nome e slug (es. "mycompany")
3. Scegli il piano (Free per iniziare)

## Step 2 — Carica i tuoi documenti

I documenti sono la knowledge base del tuo AI:
1. Vai su **Documenti** nel menu laterale
2. Clicca **Carica documento**
3. Trascina PDF o Markdown (max 10MB per file)
4. Attendi l'elaborazione (1-3 minuti)

**Tip**: Inizia con FAQ, politiche e manuali utente. Più documenti = risposte più accurate.

## Step 3 — Configura il widget

Il widget chat si integra nel tuo sito:
1. Vai su **Widget** > Personalizza
2. Scegli colori e posizione
3. Copia lo snippet JavaScript
4. Incollalo prima del tag \`</body>\` sul tuo sito

## Step 4 — Genera API key

Per integrazioni custom:
1. Vai su **Impostazioni** > **API Keys**
2. Clicca **Nuova chiave**
3. Assegna un nome (es. "Produzione")
4. Copia e conserva la chiave (mostrata una sola volta)

## Step 5 — Testa il playground

Usa il Playground per testare le risposte prima di andare live:
1. Vai su **Playground**
2. Fai una domanda di test
3. Verifica le fonti citate
4. Aggiusta i documenti se necessario

## Step 6 — Monitora le conversazioni

Nella sezione **Conversazioni** puoi:
- Leggere tutte le chat dei tuoi clienti
- Vedere quali documenti vengono citati
- Identificare domande senza risposta (per aggiungere contenuti)

## Supporto

Hai bisogno di aiuto? Chat live nella dashboard o email a support@acme.example.`,
  },
  {
    id: '00000000-0000-0000-0001-000000000004',
    org_id: MOCK_ORG_1.id,
    title: 'Specifiche Tecniche API',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Specifiche Tecniche API — Acme Corp

## Base URL

\`\`\`
https://api.acme.example/v1
\`\`\`

## Autenticazione

Tutte le richieste richiedono un header Authorization:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

Le API key si generano dalla dashboard in Impostazioni > API Keys.

## Rate Limiting

- Piano Free: 10 richieste/minuto
- Piano Pro: 100 richieste/minuto
- Piano Enterprise: custom (default 1000/min)

In caso di superamento: risposta \`429 Too Many Requests\` con header \`Retry-After\`.

## Endpoint Chat

### POST /chat

Avvia o continua una conversazione.

**Request body:**
\`\`\`json
{
  "orgSlug": "mycompany",
  "message": "Come posso recedere dal contratto?",
  "conversationId": "uuid-opzionale",
  "apiKey": "sk-..."
}
\`\`\`

**Response (SSE stream):**
\`\`\`
data: {"type":"token","text":"Puoi "}
data: {"type":"token","text":"recedere..."}
data: {"type":"done","sources":[...],"tokensUsed":312,"conversationId":"uuid"}
\`\`\`

## Endpoint Documenti

### GET /api/documents/:orgSlug

Lista documenti dell'organizzazione (richiede sessione auth).

### POST /api/documents

Upload documento. Content-Type: multipart/form-data.

## Webhook

Configura webhook in Impostazioni > Webhook per ricevere eventi:

\`\`\`json
{
  "event": "conversation.created",
  "orgId": "uuid",
  "conversationId": "uuid",
  "timestamp": "2026-05-04T10:00:00Z"
}
\`\`\`

**Eventi disponibili:** conversation.created, message.sent, document.ready, document.error

## Codici di errore

| Codice | Significato |
|--------|-------------|
| 400 | Input non valido |
| 401 | API key mancante o non valida |
| 404 | Organizzazione non trovata |
| 429 | Rate limit superato |
| 500 | Errore server interno |

## SDK ufficiali

- JavaScript/TypeScript: \`npm install @acme/sdk\`
- Python: \`pip install acme-sdk\`
- Documentazione completa: docs.acme.example`,
  },
  {
    id: '00000000-0000-0000-0001-000000000005',
    org_id: MOCK_ORG_1.id,
    title: 'Termini di Servizio',
    source_type: 'markdown' as const,
    status: 'ready' as const,
    content: `# Termini di Servizio — Acme Corp

**Ultimo aggiornamento: 1 gennaio 2026**

## 1. Accettazione dei Termini

Utilizzando Acme Corp ("Servizio") accetti i presenti Termini di Servizio. Se non accetti, non utilizzare il Servizio.

## 2. Descrizione del Servizio

Acme Corp fornisce una piattaforma SaaS per la creazione di assistenti di supporto basati su AI. Il Servizio include: caricamento documenti, indicizzazione vettoriale, chat AI, API e dashboard di analisi.

## 3. Account e Responsabilità

- Sei responsabile della sicurezza delle tue credenziali
- Non condividere la tua API key
- Notifica immediatamente eventuali accessi non autorizzati
- Ogni account è ad uso esclusivo di un'entità legale

## 4. Utilizzo Accettabile

È vietato utilizzare il Servizio per:
- Attività illegali o fraudolente
- Spam o messaggi non richiesti
- Violazione di diritti di terzi
- Reverse engineering del Servizio
- Attività che sovraccaricano l'infrastruttura

## 5. Proprietà Intellettuale

Il Servizio e il suo codice sorgente sono di proprietà di Acme Corp. I tuoi documenti e dati rimangono di tua proprietà. Concedi ad Acme Corp una licenza limitata per elaborare i dati ai fini del Servizio.

## 6. Privacy e Dati

Il trattamento dei dati personali è disciplinato dalla nostra Privacy Policy (acme.example/privacy), conforme al GDPR.

## 7. Uptime e SLA

- Piano Free: nessun SLA garantito
- Piano Pro: 99.5% uptime mensile
- Piano Enterprise: 99.9% uptime con rimborso pro-rata in caso di violazione

## 8. Limitazione di Responsabilità

Acme Corp non è responsabile per:
- Danni indiretti o consequenziali
- Perdita di dati causata da uso improprio
- Interruzioni causate da manutenzione programmata

## 9. Modifiche ai Termini

Ci riserviamo il diritto di modificare i presenti Termini con preavviso di 30 giorni via email.

## 10. Legge Applicabile

I presenti Termini sono regolati dalla legge italiana. Foro competente: Milano.

## Contatti

Per domande legali: legal@acme.example`,
  },
]

export const MOCK_CONVERSATIONS = [
  {
    id: '00000000-0000-0000-0002-000000000001',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-001',
    messages: [
      { role: 'user' as const, content: 'How does the free trial work?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'The free trial lasts 14 days with no credit card required. Sign up at app.acme.example/signup and get immediate access to all Pro features. [1]', tokens_used: 312, cost_cents: 0 },
      { role: 'user' as const, content: 'How many agents can I add during the trial?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'During the trial you have access to the Pro plan, which includes unlimited agents. After the trial ends, if you do not subscribe, the account automatically downgrades to the Free plan with a maximum of 3 agents. [1]', tokens_used: 287, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000002',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-002',
    messages: [
      { role: 'user' as const, content: 'Can I get a refund?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes, you are entitled to a full refund within 14 days of purchase. Go to Settings > Billing > Request refund in the dashboard. Refunds are processed within 5–7 business days. [2]', tokens_used: 298, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000003',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-003',
    messages: [
      { role: 'user' as const, content: 'How do I upload my documents?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Go to Knowledge Base in the sidebar and click "Add document". You can drag and drop PDFs or Markdown files up to 10 MB. Processing takes 1–3 minutes. Start with FAQs and policies for the most accurate answers. [3]', tokens_used: 321, cost_cents: 0 },
      { role: 'user' as const, content: 'What file formats are supported?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Currently PDF and Markdown (.md) are supported. The limit is 10 MB per file. For larger documents, I recommend splitting them into thematic sections before uploading. [3]', tokens_used: 256, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000004',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-004',
    messages: [
      { role: 'user' as const, content: 'How do I generate an API key?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Go to Settings > API Keys and click "New key". Assign a descriptive name (e.g. "Production") and copy the key shown — it is displayed only once. Store it somewhere secure. [3]', tokens_used: 276, cost_cents: 0 },
      { role: 'user' as const, content: 'What is the rate limit on the Pro plan?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'The Pro plan allows 100 requests per minute. If you exceed this limit you receive a 429 Too Many Requests error with a Retry-After header indicating when to retry. [4]', tokens_used: 244, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000005',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-005',
    messages: [
      { role: 'user' as const, content: 'Is Acme GDPR compliant?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes, Acme Corp is GDPR compliant. We use AES-256 encryption at rest and TLS 1.3 in transit. We are also SOC 2 Type II certified. Your documents and data remain your property. [1][5]', tokens_used: 298, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000006',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-006',
    messages: [
      { role: 'user' as const, content: 'How can I integrate Acme into my website?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'You have two options: (1) JavaScript widget: go to Embed > Install snippet, copy the script tag and paste it before your site\'s </body> tag. (2) REST API: use the POST /chat endpoint with your API key for custom integrations. [3][4]', tokens_used: 334, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000007',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-007',
    messages: [
      { role: 'user' as const, content: 'What happens when I hit the 500-conversation limit on the Free plan?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'The Free plan includes 500 conversations per month. Once the limit is reached, the chatbot stops responding until the monthly renewal. You can upgrade to Pro at any time for unlimited conversations. [1]', tokens_used: 289, cost_cents: 0 },
      { role: 'user' as const, content: 'How do I upgrade?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Go to Settings > Billing and click "Change plan". The upgrade is immediate and you will be charged the pro-rata difference for the current month. [2]', tokens_used: 221, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000008',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-008',
    messages: [
      { role: 'user' as const, content: 'Is my data safe?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Absolutely. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. The database uses Row Level Security (RLS) to guarantee tenant isolation. We are GDPR and SOC 2 Type II compliant. [1][5]', tokens_used: 312, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000009',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-009',
    messages: [
      { role: 'user' as const, content: 'Can I delete my account?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes, you can delete your account under Settings > Account > Delete account. Under GDPR you have the right to erasure of all your data. Please note that deletion is irreversible — all documents and conversations will be permanently removed. [5]', tokens_used: 301, cost_cents: 0 },
      { role: 'user' as const, content: 'Can I export my data before deleting?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'Yes, before deleting your account export your data from Settings > Export data. The export is available in JSON or CSV and includes documents, conversations, and messages. [1]', tokens_used: 265, cost_cents: 0 },
    ],
  },
  {
    id: '00000000-0000-0000-0002-000000000010',
    org_id: MOCK_ORG_1.id,
    visitor_id: 'visitor-010',
    messages: [
      { role: 'user' as const, content: 'What uptime is guaranteed on the Pro plan?', tokens_used: null, cost_cents: null },
      { role: 'assistant' as const, content: 'The Pro plan guarantees 99.5% monthly uptime. The Enterprise plan offers 99.9% uptime with pro-rata refunds for any SLA breach. The Free plan has no uptime guarantees. [5]', tokens_used: 278, cost_cents: 0 },
    ],
  },
]

export const MOCK_API_KEYS = [
  {
    id: '00000000-0000-0000-0003-000000000001',
    org_id: MOCK_ORG_1.id,
    name: 'Production',
    plaintext: 'mock-key-prod',
  },
  {
    id: '00000000-0000-0000-0003-000000000002',
    org_id: MOCK_ORG_1.id,
    name: 'Staging',
    plaintext: 'mock-key-staging',
  },
]
