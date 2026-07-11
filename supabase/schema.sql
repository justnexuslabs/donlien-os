create extension if not exists "pgcrypto";

create table if not exists public.liens (
  id uuid primary key default gen_random_uuid(),
  lien_id text not null unique,
  human_name text not null,
  lien_name text not null,
  role text not null,
  portrait_url text,
  portrait_data_url text,
  genesis_status text not null default 'candidate'
    check (genesis_status in ('candidate','eligible','waitlisted','claimed','not_applied')),
  hedera_account_id text,
  x_post_url text,
  created_at timestamptz not null default now()
);

alter table public.liens enable row level security;

drop policy if exists "No public lien enumeration" on public.liens;
create policy "No public lien enumeration"
  on public.liens
  for select
  using (false);

drop policy if exists "No public lien mutation" on public.liens;
create policy "No public lien mutation"
  on public.liens
  for all
  using (false)
  with check (false);

create index if not exists liens_created_at_idx on public.liens(created_at desc);
create index if not exists liens_genesis_status_idx on public.liens(genesis_status);

-- Portraits must live in a private Supabase Storage bucket.
-- Do not create public policies for uploaded portraits.
-- The application intentionally uses service-role server routes only for persistence.
