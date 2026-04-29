# Architectural Decisions — ai-support-dashboard

## Vector store
pgvector over Pinecone/Qdrant — single vendor (Supabase), no extra infra cost

## Auth
Supabase Auth — native RLS integration, no third-party vendor

## Mutations
Server Actions over Route Handlers — type-safe, no extra API layer

## Components
shadcn/ui copied — full control, no upstream breaking changes

## Embeddings
openai text-embedding-3-small — best cost/quality at 1536d
