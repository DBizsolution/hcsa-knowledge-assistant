-- HCSA Knowledge Assistant — knowledge base schema (pgvector)
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Embeddings are OpenAI text-embedding-3-small → 1536 dimensions.

create extension if not exists vector;

-- ── Documents ──────────────────────────────────────────────────────────────
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  source_path  text not null unique,
  -- 'policy' | 'sop' | 'email' | 'report'
  source_type  text not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ── Chunks ─────────────────────────────────────────────────────────────────
create table if not exists public.chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents (id) on delete cascade,
  chunk_index  int not null,
  content      text not null,
  token_count  int,
  metadata     jsonb not null default '{}'::jsonb,
  embedding    vector(1536),
  created_at   timestamptz not null default now()
);

-- Approximate nearest-neighbour index (cosine).
create index if not exists chunks_embedding_idx
  on public.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists chunks_document_id_idx on public.chunks (document_id);

-- ── Similarity search ──────────────────────────────────────────────────────
create or replace function public.match_chunks (
  query_embedding vector(1536),
  match_count int default 8,
  similarity_threshold float default 0.2,
  filter_source_types text[] default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  similarity float,
  document_title text,
  source_type text,
  source_path text,
  metadata jsonb
)
language sql stable
as $$
  select
    c.id,
    c.document_id,
    c.content,
    c.chunk_index,
    1 - (c.embedding <=> query_embedding) as similarity,
    d.title as document_title,
    d.source_type,
    d.source_path,
    c.metadata
  from public.chunks c
  join public.documents d on d.id = c.document_id
  where c.embedding is not null
    and (filter_source_types is null or d.source_type = any (filter_source_types))
    and 1 - (c.embedding <=> query_embedding) > similarity_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ── Row level security ─────────────────────────────────────────────────────
-- Authenticated users may read the knowledge base; writes happen via the
-- service role (ingestion script / admin server actions), which bypasses RLS.
alter table public.documents enable row level security;
alter table public.chunks enable row level security;

drop policy if exists "documents readable by authenticated" on public.documents;
create policy "documents readable by authenticated"
  on public.documents for select to authenticated using (true);

drop policy if exists "chunks readable by authenticated" on public.chunks;
create policy "chunks readable by authenticated"
  on public.chunks for select to authenticated using (true);
