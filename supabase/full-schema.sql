create extension if not exists vector;

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text default 'free',
  created_at timestamptz default now()
);

create table memberships (
  user_id uuid references auth.users on delete cascade,
  org_id uuid references organizations on delete cascade,
  role text default 'admin',
  primary key (user_id, org_id)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  title text not null,
  content text not null,
  source_type text check (source_type in ('pdf','markdown','manual')),
  status text default 'processing' check (status in ('processing','ready','error')),
  created_at timestamptz default now()
);

create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade,
  org_id uuid references organizations on delete cascade,
  content text not null,
  embedding vector(1536),
  chunk_index int,
  created_at timestamptz default now()
);
create index on chunks using ivfflat (embedding vector_cosine_ops) with (lists=100);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  visitor_id text,
  started_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade,
  role text check (role in ('user','assistant')),
  content text not null,
  sources jsonb,
  tokens_used int,
  cost_cents int,
  created_at timestamptz default now()
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  key_hash text unique not null,
  name text,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

alter table documents enable row level security;
alter table chunks enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "org members read documents"
  on documents for select using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );
create policy "org members read chunks"
  on chunks for select using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );
create or replace function match_chunks(
  p_org_id uuid,
  p_query_embedding vector(1536),
  p_top_k int default 5
)
returns table (
  content text,
  document_id uuid,
  document_title text,
  chunk_index int,
  similarity float
)
language sql stable
as $$
  select
    c.content,
    c.document_id,
    d.title as document_title,
    c.chunk_index,
    1 - (c.embedding <=> p_query_embedding) as similarity
  from chunks c
  join documents d on d.id = c.document_id
  where c.org_id = p_org_id
  order by c.embedding <=> p_query_embedding
  limit p_top_k;
$$;
-- Top user questions grouped by content
create or replace function top_questions(p_org_id uuid, p_limit int default 10)
returns table(content text, count bigint)
language sql stable as $$
  select m.content, count(*) as count
  from messages m
  join conversations c on c.id = m.conversation_id
  where c.org_id = p_org_id and m.role = 'user'
  group by m.content
  order by count desc
  limit p_limit;
$$;

-- Daily cost (assistant messages only) for the last 7 days
create or replace function daily_cost(p_org_id uuid)
returns table(day date, tokens_used bigint, cost_cents bigint)
language sql stable as $$
  select
    date_trunc('day', m.created_at)::date as day,
    coalesce(sum(m.tokens_used), 0)::bigint as tokens_used,
    coalesce(sum(m.cost_cents), 0)::bigint as cost_cents
  from messages m
  join conversations c on c.id = m.conversation_id
  where c.org_id = p_org_id
    and m.role = 'assistant'
    and m.created_at >= now() - interval '7 days'
  group by day
  order by day;
$$;

-- Average response time (ms) between user message and first assistant reply
create or replace function avg_response_time_ms(p_org_id uuid)
returns float
language sql stable as $$
  with ordered as (
    select
      m.role,
      m.created_at,
      lead(m.created_at) over (partition by m.conversation_id order by m.created_at) as next_at,
      lead(m.role)       over (partition by m.conversation_id order by m.created_at) as next_role
    from messages m
    join conversations c on c.id = m.conversation_id
    where c.org_id = p_org_id
  )
  select coalesce(
    avg(extract(epoch from (next_at - created_at)) * 1000),
    0
  )
  from ordered
  where role = 'user' and next_role = 'assistant';
$$;

-- Conversation list with aggregated message count and cost
create or replace function conversation_list(
  p_org_id uuid,
  p_since  timestamptz default null
)
returns table(
  id             uuid,
  visitor_id     text,
  started_at     timestamptz,
  message_count  bigint,
  cost_cents     bigint
)
language sql stable as $$
  select
    c.id,
    c.visitor_id,
    c.started_at,
    count(m.id)::bigint as message_count,
    coalesce(sum(m.cost_cents) filter (where m.role = 'assistant'), 0)::bigint as cost_cents
  from conversations c
  left join messages m on m.conversation_id = c.id
  where c.org_id = p_org_id
    and (p_since is null or c.started_at >= p_since)
  group by c.id
  order by c.started_at desc
  limit 100;
$$;
-- Grant table-level privileges so service_role (seed script) and
-- authenticated (app users) can access all tables.
-- Required when migrations are applied via SQL editor instead of Supabase CLI,
-- which would normally run these grants automatically.

grant all on table organizations  to service_role;
grant all on table memberships    to service_role;
grant all on table documents      to service_role;
grant all on table chunks         to service_role;
grant all on table conversations  to service_role;
grant all on table messages       to service_role;
grant all on table api_keys       to service_role;

grant select, insert, update, delete on table organizations  to authenticated;
grant select, insert, update, delete on table memberships    to authenticated;
grant select, insert, update, delete on table documents      to authenticated;
grant select, insert, update, delete on table chunks         to authenticated;
grant select, insert, update, delete on table conversations  to authenticated;
grant select, insert, update, delete on table messages       to authenticated;
grant select, insert, update, delete on table api_keys       to authenticated;

grant select on table organizations  to anon;
grant select on table documents      to anon;
