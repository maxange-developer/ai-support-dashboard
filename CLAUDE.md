# Project: ai-support-dashboard

## Stack
- next@16 · App Router · typescript strict · tailwindcss@4 · shadcn/ui
- supabase: auth + db + pgvector + storage
- anthropic SDK · claude-sonnet-4-6
- openai SDK (embeddings: text-embedding-3-small)
- unpdf (PDF parsing) · zod · lucide-react
- vitest (unit) · playwright (e2e) · deploy: vercel

## Context
AI-powered customer support dashboard. Operators upload docs (PDF/Markdown),
chat widget answers visitor questions via RAG (pgvector similarity search +
Claude). Multi-tenant via organizations table + Supabase RLS.

## Structure
- src/app/ — App Router routes · src/components/ — UI (shadcn-style)
- src/lib/ — logic, db clients, AI helpers · src/lib/ai/ — prompts + agents
- src/lib/db/ — Supabase clients · src/lib/validations/ — Zod schemas
- src/components/dashboard/ · src/components/chat/ · src/components/documents/
- supabase/migrations/ — SQL migrations
- tests/unit/ — Vitest · tests/e2e/ — Playwright

## Commands
```bash
pnpm dev · pnpm build · pnpm test · pnpm test:e2e
pnpm db:push · pnpm db:seed · gh pr create
```

## Rules
1. Zod schema in lib/validations/ — validate before any logic
2. Server Actions over Route Handlers for mutations
3. Never expose stack traces or internals to client
4. Supabase RLS by default — service role: inline comment required
5. SDK first (Anthropic/OpenAI) — raw fetch only as fallback
6. DB access from Server Components/Actions only — never Client Components
7. New env var → .env.example updated immediately
8. Return `{ success, data, error }` from Server Actions
9. Mobile-first (375px) · loading + error + empty states required
10. Embeddings: text-embedding-3-small (1536 dims) · chunk size: 512 tokens

## Forbidden
- `as Type` cast without runtime check
- `console.log` in prod (use lib/logger.ts)
- Hardcoded API keys

## Pre-commit
- [ ] pnpm build passes · [ ] pnpm test passes
- [ ] No console errors · [ ] 375px verified
- [ ] RLS in place for new tables · [ ] .env.example updated

Context files: read docs/ on demand
