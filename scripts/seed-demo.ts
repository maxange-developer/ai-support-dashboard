#!/usr/bin/env node
/**
 * Seed demo data for AI Support Dashboard.
 *
 * Usage:
 *   pnpm tsx scripts/seed-demo.ts              # seeds + embeds docs (requires OPENAI_API_KEY)
 *   pnpm tsx scripts/seed-demo.ts --skip-embed # seeds docs as ready, no chunks/embeddings
 *
 * Env vars needed in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY (unless --skip-embed)
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Load .env.local before using any env vars
try {
  const raw = readFileSync('.env.local', 'utf-8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  // .env.local not found — rely on shell env
}

const SKIP_EMBED = process.argv.includes('--skip-embed')
const BATCH_SIZE = 100

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const openai = getOpenAI()
  const results: number[][] = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: batch })
    results.push(...res.data.map((d) => d.embedding))
  }
  return results
}

function chunkText(content: string, charSize = 2048, step = 1848): { content: string; chunkIndex: number }[] {
  const chunks: { content: string; chunkIndex: number }[] = []
  let start = 0
  let index = 0
  while (start < content.length) {
    const end = Math.min(start + charSize, content.length)
    const text = content.slice(start, end).trim()
    if (text.length > 0) chunks.push({ content: text, chunkIndex: index++ })
    if (end === content.length) break
    start += step
  }
  return chunks
}

// ─── Demo data ───────────────────────────────────────────────────────────────

const FAQS: { title: string; content: string }[] = [
  {
    title: 'Politica di reso',
    content: `# Politica di reso\n\nAcme accetta resi entro 30 giorni dall'acquisto. Il prodotto deve essere integro, non utilizzato e nell'imballaggio originale.\n\nPer avviare un reso:\n1. Contatta il supporto all'indirizzo support@acme.example\n2. Indica il numero ordine e il motivo del reso\n3. Ricevi l'etichetta di spedizione prepagata\n\nI rimborsi vengono elaborati entro 5-7 giorni lavorativi dalla ricezione del reso.`,
  },
  {
    title: 'Spedizione e consegna',
    content: `# Spedizione e consegna\n\nAcme spedisce in tutta Italia con corriere espresso.\n\n- **Standard** (3-5 giorni): gratuita per ordini > €50, altrimenti €4,90\n- **Express** (1-2 giorni): €9,90\n- **Same Day** (Milano): €14,90\n\nTracking disponibile via email entro 2 ore dalla spedizione.`,
  },
  {
    title: 'Garanzia prodotti',
    content: `# Garanzia prodotti\n\nTutti i prodotti Acme sono coperti da garanzia legale di 2 anni ai sensi del D.Lgs. 206/2005.\n\nPer difetti di fabbricazione entro i 2 anni:\n- Riparazione gratuita\n- Sostituzione se la riparazione non è possibile\n- Rimborso in casi eccezionali\n\nLa garanzia non copre danni da uso improprio o cause accidentali.`,
  },
  {
    title: 'Pagamenti accettati',
    content: `# Pagamenti accettati\n\nAcme accetta i seguenti metodi di pagamento:\n\n- Carta di credito/debito (Visa, Mastercard, Amex)\n- PayPal\n- Bonifico bancario (per ordini B2B)\n- Klarna (pagamento a rate senza interessi)\n- Apple Pay / Google Pay\n\nTutte le transazioni sono protette con crittografia SSL.`,
  },
  {
    title: 'Account e registrazione',
    content: `# Account e registrazione\n\nCreare un account Acme è gratuito e ti permette di:\n\n- Tracciare i tuoi ordini in tempo reale\n- Salvare indirizzi di spedizione multipli\n- Accedere alla cronologia acquisti\n- Ricevere offerte personalizzate\n\nPer creare un account vai su acme.example/registrati e inserisci email e password.`,
  },
  {
    title: 'Cambio misura',
    content: `# Cambio misura\n\nSe hai ordinato la taglia sbagliata, puoi richiedere un cambio entro 30 giorni.\n\nIl cambio è gratuito per la prima volta su ogni ordine. Per cambio successivi si applicano €2,90 di spedizione.\n\nDisponibilità del cambio dipende dallo stock. In caso di mancanza, verrà emesso un voucher.`,
  },
  {
    title: 'Programma fedeltà',
    content: `# Programma fedeltà AcmeRewards\n\nOgni euro speso vale 1 punto. I punti si accumulano e possono essere convertiti in sconti:\n\n- 100 punti = €1 di sconto\n- 500 punti = 10% di sconto su un ordine\n- 1000 punti = spedizione gratuita per 6 mesi\n\nI punti scadono dopo 12 mesi di inattività.`,
  },
  {
    title: 'Come tracciare un ordine',
    content: `# Come tracciare un ordine\n\nDopo la spedizione riceverai un'email con il numero di tracciamento del corriere.\n\nPuoi tracciare il tuo ordine:\n1. Nell'email di spedizione (link diretto al tracking)\n2. Nell'area personale su acme.example/ordini\n3. Sul sito del corriere (GLS, BRT, o DHL) usando il numero di tracking\n\nPer ordini express, l'aggiornamento avviene ogni 2 ore.`,
  },
  {
    title: 'Contatti e orari supporto',
    content: `# Contatti e orari supporto\n\nIl team di supporto Acme è disponibile:\n\n- **Chat live**: Lun-Ven 9:00-18:00\n- **Email**: support@acme.example (risposta entro 24h)\n- **Telefono**: 02 1234 5678 (Lun-Ven 9:00-17:00)\n\nPer urgenze fuori orario, il chatbot AI risponde 24/7.`,
  },
  {
    title: 'Fatturazione e dati fiscali',
    content: `# Fatturazione e dati fiscali\n\nPer richiedere la fattura con dati aziendali:\n1. Durante il checkout seleziona "Fattura aziendale"\n2. Inserisci Ragione Sociale, P.IVA, Codice SDI o PEC\n\nLe fatture vengono emesse entro 24h dall'ordine e inviate via SDI.\nPer fatture già emesse con dati errati, contatta il supporto entro 5 giorni.`,
  },
  {
    title: 'Codici sconto e promozioni',
    content: `# Codici sconto e promozioni\n\nI codici sconto si inseriscono nel carrello prima di procedere al pagamento.\n\nRegole principali:\n- Un solo codice per ordine\n- Non cumulabili con altre promozioni\n- Esclusi articoli già in saldo\n- Validi per ordini minimi (specificato sul coupon)\n\nI codici scaduti non possono essere riattivati.`,
  },
  {
    title: 'Prodotti esauriti',
    content: `# Prodotti esauriti\n\nSe un prodotto è esaurito, puoi attivare la notifica di disponibilità:\n1. Vai alla pagina prodotto\n2. Seleziona la variante desiderata\n3. Clicca su "Avvisami quando disponibile"\n4. Inserisci la tua email\n\nRiceverai una notifica appena il prodotto torna in stock. Non c'è garanzia di disponibilità.`,
  },
  {
    title: 'Ordini B2B e grossisti',
    content: `# Ordini B2B e grossisti\n\nAcme offre condizioni speciali per rivenditori e acquisti aziendali voluminosi.\n\nBenefici B2B:\n- Sconti sul volume (da 10% per ordini > €500)\n- Pagamento 30/60 giorni con fattura\n- Agente dedicato\n- Catalogo PDF aggiornato mensile\n\nContatta sales@acme.example per aprire un account B2B.`,
  },
  {
    title: 'Imballaggio eco-sostenibile',
    content: `# Imballaggio eco-sostenibile\n\nAcme utilizza esclusivamente imballaggi riciclati e riciclabili:\n\n- Scatole in cartone FSC riciclato al 100%\n- Riempitivo in carta (no polistirolo)\n- Nastro adesivo in carta biodegradabile\n- Nessun sacchetto di plastica\n\nIl peso dell'imballaggio è ottimizzato per ridurre le emissioni CO₂ della spedizione.`,
  },
  {
    title: 'Applicazione mobile',
    content: `# Applicazione mobile Acme\n\nL'app Acme è disponibile gratuitamente su iOS e Android.\n\nFunzionalità principali:\n- Acquisto rapido con Apple Pay / Google Pay\n- Tracking ordini in tempo reale con notifiche push\n- Scanner codice a barre per trovare prodotti\n- Lista desideri sincronizzata\n- Accesso prioritario alle offerte flash\n\nDownload: acme.example/app`,
  },
  {
    title: 'Privacy e GDPR',
    content: `# Privacy e GDPR\n\nAcme è conforme al Regolamento UE 2016/679 (GDPR).\n\nI tuoi diritti:\n- **Accesso**: richiedi copia dei tuoi dati\n- **Rettifica**: correggi dati errati\n- **Cancellazione**: richiedi la rimozione\n- **Portabilità**: esporta i tuoi dati\n- **Opposizione**: disattiva il marketing\n\nContatta privacy@acme.example per esercitare i tuoi diritti. Risposta entro 30 giorni.`,
  },
  {
    title: 'Newsletter e comunicazioni',
    content: `# Newsletter e comunicazioni\n\nIscrivendoti alla newsletter Acme ricevi:\n- Offerte esclusive solo per iscritti\n- Anticipazioni sui nuovi prodotti\n- Guide e tutorial\n\nPuoi disiscriverti in qualsiasi momento cliccando "Annulla iscrizione" in fondo a ogni email.\n\nFrequenza: massimo 2 email a settimana. Non vendiamo la tua email a terze parti.`,
  },
  {
    title: 'Riparazioni e assistenza tecnica',
    content: `# Riparazioni e assistenza tecnica\n\nPer prodotti tecnici fuori garanzia offriamo servizio di riparazione a pagamento.\n\n1. Richiedi preventivo gratuito via email con foto del danno\n2. Spedisci il prodotto al nostro centro (imballo a tuo carico)\n3. Ricevi preventivo entro 3 giorni lavorativi\n4. Approva e il prodotto viene riparato in 5-10 giorni\n5. Rispedito a casa tua\n\nCosto diagnosi: €15 (incluso nel costo riparazione se approvata).`,
  },
  {
    title: 'Personalizzazione prodotti',
    content: `# Personalizzazione prodotti\n\nAcme offre personalizzazione per ordini di almeno 10 pezzi:\n\n- Stampa logo aziendale\n- Colori personalizzati\n- Packaging brandizzato\n- Etichette customizzate\n\nTempi: 15-20 giorni lavorativi dalla conferma del layout.\nRichiedi preventivo a custom@acme.example con quantità e specifiche.`,
  },
  {
    title: 'Affiliate e partnership',
    content: `# Programma Affiliate Acme\n\nGuadagna fino al 12% su ogni vendita generata dai tuoi link.\n\nCome funziona:\n1. Registrati su acme.example/affiliate\n2. Ottieni link unici tracciati\n3. Condividili su blog, social o newsletter\n4. Guadagna commissioni su ogni acquisto\n\nPagamenti mensili via PayPal o bonifico (minimo €50). Statistiche in tempo reale nella dashboard.`,
  },
]

const CONVERSATIONS: { visitorId: string; messages: { role: 'user' | 'assistant'; content: string }[] }[] = [
  {
    visitorId: 'visitor-001',
    messages: [
      { role: 'user', content: 'Qual è la politica di reso?' },
      {
        role: 'assistant',
        content:
          'Acme accetta resi entro 30 giorni dall\'acquisto. Il prodotto deve essere integro, non utilizzato e nell\'imballaggio originale. Per avviare un reso contatta support@acme.example con il numero ordine e il motivo. I rimborsi vengono elaborati entro 5-7 giorni lavorativi. [1]',
      },
      { role: 'user', content: 'E se la merce è difettosa?' },
      {
        role: 'assistant',
        content:
          'In caso di difetti di fabbricazione entro 2 anni dall\'acquisto, la garanzia legale copre riparazione gratuita, sostituzione se la riparazione non è possibile, o rimborso in casi eccezionali. La garanzia non copre danni da uso improprio o cause accidentali. [3]',
      },
    ],
  },
  {
    visitorId: 'visitor-002',
    messages: [
      { role: 'user', content: 'Quanto costa la spedizione?' },
      {
        role: 'assistant',
        content:
          'La spedizione standard (3-5 giorni) è gratuita per ordini superiori a €50, altrimenti €4,90. L\'express (1-2 giorni) costa €9,90. A Milano è disponibile anche il same day a €14,90. [2]',
      },
      { role: 'user', content: 'Come posso tracciare il mio pacco?' },
      {
        role: 'assistant',
        content:
          'Dopo la spedizione riceverai un\'email con il numero di tracking del corriere. Puoi seguire il tuo ordine tramite il link nell\'email, nell\'area personale su acme.example/ordini, oppure direttamente sul sito del corriere. [8]',
      },
    ],
  },
  {
    visitorId: 'visitor-003',
    messages: [
      { role: 'user', content: 'Accettate pagamenti con PayPal?' },
      {
        role: 'assistant',
        content:
          'Sì, Acme accetta PayPal insieme a carte di credito/debito (Visa, Mastercard, Amex), bonifico bancario per ordini B2B, Klarna per il pagamento a rate, e Apple Pay / Google Pay. Tutte le transazioni sono protette con SSL. [4]',
      },
    ],
  },
  {
    visitorId: 'visitor-004',
    messages: [
      { role: 'user', content: 'Come posso iscrivermi al programma fedeltà?' },
      {
        role: 'assistant',
        content:
          'Il programma AcmeRewards è automaticamente attivo per tutti gli account registrati. Ogni euro speso vale 1 punto: 100 punti = €1 di sconto, 500 punti = 10% di sconto su un ordine, 1000 punti = spedizione gratuita per 6 mesi. I punti scadono dopo 12 mesi di inattività. [7]',
      },
      { role: 'user', content: 'Avete un\'app mobile?' },
      {
        role: 'assistant',
        content:
          'Sì! L\'app Acme è gratuita su iOS e Android. Permette acquisti rapidi con Apple Pay/Google Pay, tracking ordini in tempo reale con notifiche push, scanner codici a barre e lista desideri sincronizzata. Scaricala da acme.example/app. [15]',
      },
    ],
  },
  {
    visitorId: 'visitor-005',
    messages: [
      { role: 'user', content: 'Posso avere la fattura con i dati della mia azienda?' },
      {
        role: 'assistant',
        content:
          'Certamente! Durante il checkout seleziona "Fattura aziendale" e inserisci Ragione Sociale, P.IVA, Codice SDI o PEC. Le fatture vengono emesse entro 24h dall\'ordine tramite SDI. Per fatture già emesse con dati errati, contatta il supporto entro 5 giorni. [10]',
      },
    ],
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding Acme Demo…')

  // 1. Upsert org
  const { data: orgData, error: orgError } = await admin
    .from('organizations')
    .upsert({ name: 'Acme Demo', slug: 'acme-demo' }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (orgError) throw new Error(`org upsert: ${orgError.message}`)
  const orgId = (orgData as { id: string }).id
  console.log(`✓ Org: ${orgId}`)

  // 2. Documents
  let docCount = 0
  for (const faq of FAQS) {
    const { data: doc, error: docErr } = await admin
      .from('documents')
      .insert({ org_id: orgId, title: faq.title, content: faq.content, source_type: 'markdown', status: SKIP_EMBED ? 'ready' : 'processing' })
      .select('id')
      .single()

    if (docErr) {
      console.warn(`  skip "${faq.title}": ${docErr.message}`)
      continue
    }

    const docId = (doc as { id: string }).id

    if (!SKIP_EMBED) {
      const chunks = chunkText(faq.content)
      const embeddings = await embedBatch(chunks.map((c) => c.content))
      const payload = chunks.map((c, i) => ({
        document_id: docId,
        org_id: orgId,
        content: c.content,
        embedding: embeddings[i],
        chunk_index: c.chunkIndex,
      }))
      if (payload.length > 0) {
        const { error: chunkErr } = await admin.from('chunks').insert(payload)
        if (chunkErr) throw new Error(`chunks insert: ${chunkErr.message}`)
      }
      await admin.from('documents').update({ status: 'ready' }).eq('id', docId)
    }

    docCount++
  }
  console.log(`✓ Documents: ${docCount}/${FAQS.length}${SKIP_EMBED ? ' (no embeddings)' : ''}`)

  // 3. Conversations
  let convCount = 0
  for (const conv of CONVERSATIONS) {
    const startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: convData, error: convErr } = await admin
      .from('conversations')
      .insert({ org_id: orgId, visitor_id: conv.visitorId, started_at: startedAt })
      .select('id')
      .single()

    if (convErr) throw new Error(`conversation insert: ${convErr.message}`)
    const convId = (convData as { id: string }).id

    for (const msg of conv.messages) {
      const isAssistant = msg.role === 'assistant'
      await admin.from('messages').insert({
        conversation_id: convId,
        role: msg.role,
        content: msg.content,
        tokens_used: isAssistant ? Math.floor(Math.random() * 200 + 50) : null,
        cost_cents: isAssistant ? Math.floor(Math.random() * 5 + 1) : null,
      })
    }

    convCount++
  }
  console.log(`✓ Conversations: ${convCount}`)

  console.log('\n✅ Done! Org slug: acme-demo')
  if (SKIP_EMBED) {
    console.log('   ⚠ Documents seeded without embeddings (--skip-embed). Chat will return no results.')
    console.log('   Re-run without --skip-embed (requires OPENAI_API_KEY) to add embeddings.')
  }
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
