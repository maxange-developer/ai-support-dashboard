# AI Support Dashboard

> Multi-tenant RAG-powered customer-support platform — operators upload docs, visitors get instant answers via an embeddable chat widget.

**Live demo:** [ai-support-dashboard-six.vercel.app](https://ai-support-dashboard-six.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)
![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?logo=openai)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## What it is

A productized SaaS dashboard operators use to:

- **Upload knowledge** — PDF or Markdown docs ingested, chunked, and embedded into pgvector
- **Answer visitors** — embeddable `<script>` widget + API key auth; answers streamed via SSE with source citations
- **Measure usage** — conversation history, token costs, top questions, avg response time

Two demo workspaces are included: **Stratos** (product analytics SaaS, Pro plan) and **Nimbus Labs** (internal HR, Free plan). Login: click _Enter demo_ — sample data resets each session.

---

## Features

| Area | Details |
|------|---------|
| Document management | Upload PDF/Markdown → parse → chunk (512 tokens) → embed → store in pgvector |
| Chat widget | Embeddable via `<script>` tag + API key; SSE streaming with typing indicator |
| RAG pipeline | `text-embedding-3-small` query embedding → pgvector cosine similarity → `gpt-4o-mini` answer |
| Analytics dashboard | Token cost by day (Recharts), conversation list, top questions, avg response time |
| Multi-tenant | Supabase RLS — every query is org-scoped; no cross-tenant data leakage |
| API key management | Create/revoke keys; hashed (SHA-256) at rest, never stored in plaintext |
| Mock mode | Full offline demo: no AI key, no DB needed — `USE_MOCK_AUTH + USE_MOCK_AI + USE_MOCK_DATA` |
| i18n | EN / IT / ES via next-intl |

---

## Interesting engineering decisions

### Hybrid retrieval with source attribution
The `/api/chat` route embeds the user message, runs pgvector cosine similarity, injects the top chunks into the system prompt with doc titles, and streams the answer as SSE. The `done` event carries a `sources` array back to the client so the widget can surface citations without a second round-trip.

### Mock-first architecture
Three independent env flags (`USE_MOCK_AUTH`, `USE_MOCK_AI`, `USE_MOCK_DATA`) let the app run 100% offline. Mock fixtures live in `src/lib/mock/` and mirror the real DB schema; the seeder script (`scripts/seed-mock.ts`) uses `upsert` so it's safe to run repeatedly. This means the Vercel preview URL works without any secrets.

### SSE streaming from a Next.js Route Handler
Rather than waiting for the full LLM response, the chat route returns a `ReadableStream` with `Content-Type: text/event-stream`. The client reads it chunk-by-chunk and renders tokens as they arrive, keeping time-to-first-token under 300 ms even on the free OpenAI tier.

### Supabase RLS everywhere
Every table has a Row Level Security policy. The dashboard uses the Supabase service role only for analytics queries (conversations and messages have no user-facing SELECT policy by design — they're operator-only). The chat widget path goes through API key auth, not session cookies.

---

## Setup

**1. Clone and install**
```bash
git clone <repo-url>
cd ai-support-dashboard
pnpm install
```

**2. Configure environment**
```bash
cp .env.example .env.local
# Required:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   OPENAI_API_KEY
#   NEXT_PUBLIC_APP_URL
```

Run migrations from `supabase/migrations/` in order via the Supabase SQL editor.

**3. Seed demo data**
```bash
pnpm tsx scripts/seed-mock.ts   # creates orgs, docs, conversations, API keys, test user
```

**4. Start**
```bash
pnpm dev        # http://localhost:3000
pnpm build      # production build
```

**Zero-config offline mode** — add these to `.env.local` and skip steps 2–3:
```bash
USE_MOCK_AUTH=true
USE_MOCK_AI=true
USE_MOCK_DATA=true
NEXT_PUBLIC_USE_MOCK=true
```

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 App Router | Server Components + RSC streaming |
| Database | Supabase Postgres + pgvector | Auth, RLS, and vector search in one service |
| LLM | OpenAI gpt-4o-mini | Fast streaming, low cost per token |
| Embeddings | OpenAI text-embedding-3-small | 1536 dims, fast, cost-effective |
| UI | Tailwind CSS v4 + Base UI primitives | Unstyled components, full design control |
| Charts | Recharts | React 19 compatible |
| i18n | next-intl | Type-safe, RSC-compatible |

---

## Deploy

```bash
vercel link       # connect to Vercel project once
# add env vars in Vercel dashboard
vercel --prod
```

The app auto-detects `NEXT_PUBLIC_USE_MOCK=true` on the preview URL so reviewers see live data without needing a real Supabase project.

---

## What's next

- **Conversation history in chat** — currently single-turn; multi-turn context window is the next RAG improvement
- **Webhook delivery** — operators subscribe to `conversation.created` / `message.created` events
- **Usage-based billing** — Stripe metered billing tied to token consumption per org
- **Widget customisation** — theme, welcome message, and suggested questions configurable from the dashboard

---

## License

MIT
