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
