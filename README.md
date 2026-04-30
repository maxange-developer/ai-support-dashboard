# AI Support Dashboard

Multi-tenant AI customer-support platform. Operators upload PDF/Markdown docs; visitors get instant answers via a chat widget powered by RAG (pgvector similarity search + Claude). Includes a full dashboard with analytics, conversation history, and embeddable widget with API-key auth.

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)
![Anthropic](https://img.shields.io/badge/Claude_Sonnet_4.6-anthropic-orange)
![OpenAI](https://img.shields.io/badge/OpenAI_Embeddings-412991?logo=openai)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

**Demo:** <!-- DEMO_URL -->  
**Walkthrough:** <!-- LOOM_URL -->

---

## Setup

**1. Clone and install**
```bash
git clone <repo-url>
cd 01-ai-support-dashboard
pnpm install
```

**2. Configure environment**
```bash
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY,
#          NEXT_PUBLIC_APP_URL
```

Run migrations in the Supabase dashboard (SQL editor) from `supabase/migrations/` in order.

**3. Start**
```bash
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm test       # unit tests (Vitest)
pnpm test:e2e   # E2E tests (Playwright — needs live env + TEST_EMAIL/TEST_PASSWORD)
```

---

## Seed demo data

```bash
# With embeddings (requires OPENAI_API_KEY, ~$0.001):
pnpm tsx scripts/seed-demo.ts

# Without embeddings (no AI key needed, chat returns no results):
pnpm tsx scripts/seed-demo.ts --skip-embed
```

Creates org `acme-demo` with 20 FAQ docs and 5 sample conversations.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 App Router | Server Components + streaming |
| Database | Supabase + pgvector | Auth, RLS, vector search in one |
| LLM | Claude Sonnet 4.6 | Best quality/cost for support use-case |
| Embeddings | OpenAI text-embedding-3-small | 1536 dims, fast, cheap |
| UI | Tailwind v4 + Base UI | Unstyled primitives, full control |
| Charts | Recharts | Works with React 19 |

## Deploy

```bash
# One-time setup
vercel link                  # connect to Vercel project
# Add all env vars in Vercel dashboard

# Deploy
vercel --prod
```
