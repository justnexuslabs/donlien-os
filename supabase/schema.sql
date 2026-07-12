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
  signup_stage text not null default 'human_input'
    check (signup_stage in ('human_input','upload','transform','review','activation')),
  signup_completed boolean not null default false,
  last_activity_at timestamptz not null default now(),
  abandoned_at timestamptz,
  webhook_status text not null default 'not_configured'
    check (webhook_status in ('not_configured','not_sent','sent','failed')),
  hedera_account_id text,
  x_post_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.signup_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  stage text not null check (stage in ('human_input','upload','transform','review','activation')),
  human_name text,
  lien_name text,
  role text,
  lien_id text,
  completed boolean not null default false,
  occurred_at timestamptz not null default now()
);

alter table public.liens add column if not exists signup_stage text not null default 'human_input';
alter table public.liens add column if not exists signup_completed boolean not null default false;
alter table public.liens add column if not exists last_activity_at timestamptz not null default now();
alter table public.liens add column if not exists abandoned_at timestamptz;
alter table public.liens add column if not exists webhook_status text not null default 'not_configured';

alter table public.liens enable row level security;
alter table public.signup_events enable row level security;

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

drop policy if exists "No public signup event enumeration" on public.signup_events;
create policy "No public signup event enumeration"
  on public.signup_events
  for select
  using (false);

drop policy if exists "No public signup event mutation" on public.signup_events;
create policy "No public signup event mutation"
  on public.signup_events
  for all
  using (false)
  with check (false);

create index if not exists liens_created_at_idx on public.liens(created_at desc);
create index if not exists liens_genesis_status_idx on public.liens(genesis_status);
create index if not exists liens_last_activity_idx on public.liens(last_activity_at desc);
create index if not exists signup_events_session_idx on public.signup_events(session_id, occurred_at desc);
create index if not exists signup_events_stage_idx on public.signup_events(stage, occurred_at desc);

-- Portraits must live in a private Supabase Storage bucket.
-- Do not create public policies for uploaded portraits.
-- The application intentionally uses service-role server routes only for persistence.
