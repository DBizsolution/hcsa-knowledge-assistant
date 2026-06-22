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

-- ── Structured project datasets (relational mock corpus) ────────────────────
-- Contractors → Projects → Permits / Inspections. Loaded by
-- `pnpm ingest:structured`. Categorical columns are normalised to UPPER_SNAKE
-- on ingest; date columns are parsed to real dates so the NL→SQL path can do
-- aggregations, joins and date arithmetic. No hard foreign keys — the mock data
-- contains some orphan references, which we keep rather than drop.

create table if not exists public.contractors (
  contractor_id            text primary key,
  name                     text,
  contact_number           text,
  company_address          text,
  contract_start_date      date,
  contractor_rating        text,   -- GOLD | SILVER | BRONZE | PLATINUM
  sustainability_rating    text,   -- A_PLUS | A | B_PLUS | B | C_PLUS | C | UNRATED
  financial_health_rating  text,   -- EXCELLENT | GOOD | FAIR | UNDER_REVIEW
  engagement_status        text,   -- ACTIVE | INACTIVE | SUSPENDED | PENDING
  completed_projects       int
);

create table if not exists public.projects (
  project_id                text primary key,
  name                      text,
  contractor_id             text,  -- → contractors.contractor_id
  start_date                date,
  scheduled_completion_date date,
  actual_completion_date    date,
  status                    text,  -- PLANNING | PERMITTING | CONSTRUCTION | ON_HOLD | SUSPENDED | COMPLETED | CANCELLED
  estimated_cost            numeric,
  actual_cost               numeric
);

create table if not exists public.permits (
  permit_id                 text primary key,
  project_id                text,  -- source "Assignment ID" → projects.project_id
  permit_type               text,
  permit_category           text,
  approval_date             date,
  expiry_date               date,
  permit_status             text,  -- APPROVED | PENDING | RENEWED | REVOKED | REJECTED | EXPIRED
  permit_conditions         int,
  conditions_met            int,
  processing_fee            numeric
);

create table if not exists public.inspections (
  inspection_id             text primary key,
  project_id                text,  -- source "Case ID" → projects.project_id
  inspection_date           date,
  inspection_type           text,
  inspector_company         text,
  inspection_result         text,  -- PASS | FAIL | PASS_WITH_ADVISORY | CONDITIONAL_PASS
  defects_found             int,
  rectification_required    boolean,
  rectification_deadline    date,
  rectification_completed   boolean,
  follow_up_inspection_date date,
  inspection_cost           numeric
);

create index if not exists projects_contractor_idx on public.projects (contractor_id);
create index if not exists permits_project_idx on public.permits (project_id);
create index if not exists inspections_project_idx on public.inspections (project_id);

alter table public.contractors enable row level security;
alter table public.projects    enable row level security;
alter table public.permits     enable row level security;
alter table public.inspections enable row level security;

do $$
declare t text;
begin
  foreach t in array array['contractors', 'projects', 'permits', 'inspections'] loop
    execute format('drop policy if exists "%s readable by authenticated" on public.%I', t, t);
    execute format(
      'create policy "%s readable by authenticated" on public.%I for select to authenticated using (true)',
      t, t);
  end loop;
end $$;

-- ── Read-only analytical query execution ────────────────────────────────────
-- The chat route translates a natural-language question into a single SELECT
-- and runs it here. Guarded to SELECT/WITH only, single statement, no DDL/DML,
-- no system catalogs, with a statement timeout. Executable by service_role only
-- (the server-side admin client). This is a controlled-query gateway, not an
-- open SQL endpoint.
create or replace function public.run_readonly_query(query_text text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  cleaned text := btrim(query_text);
begin
  cleaned := regexp_replace(cleaned, ';\s*$', '');           -- drop one trailing ;
  if cleaned !~* '^(select|with)\M' then
    raise exception 'Only SELECT/WITH queries are permitted';
  end if;
  if cleaned ~ ';' then
    raise exception 'Multiple statements are not permitted';
  end if;
  if cleaned ~* '\m(insert|update|delete|drop|alter|truncate|create|grant|revoke|comment|copy|merge|call|do|vacuum|analyze|reindex)\M' then
    raise exception 'Only read-only queries are permitted';
  end if;
  if cleaned ~* '(pg_|information_schema)' then
    raise exception 'System catalog access is not permitted';
  end if;
  perform set_config('statement_timeout', '5000', true);
  execute format('select coalesce(jsonb_agg(t), ''[]''::jsonb) from (%s) as t', cleaned)
    into result;
  return result;
end;
$$;

revoke all on function public.run_readonly_query(text) from public;
grant execute on function public.run_readonly_query(text) to service_role;
