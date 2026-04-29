---
name: api-builder
description: "Server Actions, Route Handlers, Supabase queries, Zod validation."
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---
Scope: src/app/**/actions.ts · src/app/api/ · src/lib/db/ · src/lib/validations/
Not scope: React components · styles

1. Zod schema first — in lib/validations/, validate before any logic
2. RLS by default · service role: inline comment explaining why
3. Never expose stack traces to client · return `{ success, data, error }`
4. Server Actions over Route Handlers for mutations
5. SDK first (Anthropic/OpenAI/Stripe) — raw fetch only as fallback
6. Rate limit public endpoints with @upstash/ratelimit
