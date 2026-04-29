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
