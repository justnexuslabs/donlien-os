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

create table if not exists public.rate_limits (
  bucket_key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create table if not exists public.generation_sessions (
  session_id text primary key,
  free_generations_used integer not null default 0,
  paid_credits integer not null default 0,
  paid_generations_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.consume_rate_limit(
  bucket_key text,
  bucket_limit integer,
  window_seconds integer
)
returns table(allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  current_reset timestamptz;
begin
  delete from public.rate_limits where public.rate_limits.reset_at <= now();

  insert into public.rate_limits(bucket_key, count, reset_at)
  values (bucket_key, 0, now() + make_interval(secs => window_seconds))
  on conflict (bucket_key) do nothing;

  update public.rate_limits
  set
    count = case
      when public.rate_limits.reset_at <= now() then 1
      when public.rate_limits.count < bucket_limit then public.rate_limits.count + 1
      else public.rate_limits.count
    end,
    reset_at = case
      when public.rate_limits.reset_at <= now() then now() + make_interval(secs => window_seconds)
      else public.rate_limits.reset_at
    end
  where public.rate_limits.bucket_key = consume_rate_limit.bucket_key
  returning public.rate_limits.count, public.rate_limits.reset_at
  into current_count, current_reset;

  allowed := current_count <= bucket_limit;
  remaining := greatest(bucket_limit - current_count, 0);
  reset_at := current_reset;
  return next;
end;
$$;

create or replace function public.add_generation_credits(
  target_session_id text,
  credit_count integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.generation_sessions(session_id, paid_credits, updated_at)
  values (target_session_id, greatest(credit_count, 0), now())
  on conflict (session_id) do update
  set
    paid_credits = public.generation_sessions.paid_credits + greatest(credit_count, 0),
    updated_at = now();
end;
$$;

alter table public.liens add column if not exists signup_stage text not null default 'human_input';
alter table public.liens add column if not exists signup_completed boolean not null default false;
alter table public.liens add column if not exists last_activity_at timestamptz not null default now();
alter table public.liens add column if not exists abandoned_at timestamptz;
alter table public.liens add column if not exists webhook_status text not null default 'not_configured';

alter table public.liens enable row level security;
alter table public.signup_events enable row level security;
alter table public.rate_limits enable row level security;
alter table public.generation_sessions enable row level security;

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
create index if not exists rate_limits_reset_at_idx on public.rate_limits(reset_at);
create index if not exists generation_sessions_updated_at_idx on public.generation_sessions(updated_at desc);

-- Portraits must live in a private Supabase Storage bucket.
-- Do not create public policies for uploaded portraits.
-- The application intentionally uses service-role server routes only for persistence.
