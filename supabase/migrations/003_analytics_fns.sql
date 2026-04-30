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
