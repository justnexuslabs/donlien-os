create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active'
    check (status in ('active','recovery_hold','suspended','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null
    check (provider in ('telegram','email','passkey','wallet')),
  provider_user_id text not null,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_user_id)
);

create table if not exists public.lien_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  lien_id text not null unique,
  lien_name text not null,
  founding_status text not null default 'standard'
    check (founding_status in ('standard','founding','genesis')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.liens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
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

-- Existing installations need the ownership column added before policies,
-- indexes, views, or resolver functions reference it.
alter table public.liens
  add column if not exists user_id uuid references public.users(id) on delete set null;

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
  standard_credits integer not null default 0,
  holographic_credits integer not null default 0,
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

alter table public.generation_sessions
  add column if not exists standard_credits integer not null default 0;
alter table public.generation_sessions
  add column if not exists holographic_credits integer not null default 0;

drop function if exists public.add_generation_credits(text, integer);
create or replace function public.add_generation_credits(
  target_session_id text,
  target_edition text,
  credit_count integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_edition not in ('standard', 'holographic') then
    raise exception 'Invalid card edition';
  end if;

  insert into public.generation_sessions(
    session_id,
    standard_credits,
    holographic_credits,
    updated_at
  )
  values (
    target_session_id,
    case when target_edition = 'standard' then greatest(credit_count, 0) else 0 end,
    case when target_edition = 'holographic' then greatest(credit_count, 0) else 0 end,
    now()
  )
  on conflict (session_id) do update
  set
    standard_credits = public.generation_sessions.standard_credits +
      case when target_edition = 'standard' then greatest(credit_count, 0) else 0 end,
    holographic_credits = public.generation_sessions.holographic_credits +
      case when target_edition = 'holographic' then greatest(credit_count, 0) else 0 end,
    updated_at = now();
end;
$$;

alter table public.liens add column if not exists signup_stage text not null default 'human_input';
alter table public.liens add column if not exists signup_completed boolean not null default false;
alter table public.liens add column if not exists last_activity_at timestamptz not null default now();
alter table public.liens add column if not exists abandoned_at timestamptz;
alter table public.liens add column if not exists webhook_status text not null default 'not_configured';

alter table public.liens enable row level security;
alter table public.users enable row level security;
alter table public.auth_identities enable row level security;
alter table public.lien_profiles enable row level security;
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

drop policy if exists "No public user access" on public.users;
create policy "No public user access"
  on public.users for all using (false) with check (false);

drop policy if exists "No public auth identity access" on public.auth_identities;
create policy "No public auth identity access"
  on public.auth_identities for all using (false) with check (false);

drop policy if exists "No public LIEN profile access" on public.lien_profiles;
create policy "No public LIEN profile access"
  on public.lien_profiles for all using (false) with check (false);

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
create index if not exists liens_user_id_idx on public.liens(user_id);
create index if not exists auth_identities_user_id_idx on public.auth_identities(user_id);
create index if not exists lien_profiles_lien_id_idx on public.lien_profiles(lien_id);
create index if not exists liens_genesis_status_idx on public.liens(genesis_status);
create index if not exists liens_last_activity_idx on public.liens(last_activity_at desc);
create index if not exists signup_events_session_idx on public.signup_events(session_id, occurred_at desc);
create index if not exists signup_events_stage_idx on public.signup_events(stage, occurred_at desc);
create index if not exists rate_limits_reset_at_idx on public.rate_limits(reset_at);
create index if not exists generation_sessions_updated_at_idx on public.generation_sessions(updated_at desc);

-- Portraits must live in a private Supabase Storage bucket.
-- Do not create public policies for uploaded portraits.
-- The application intentionally uses service-role server routes only for persistence.
create table if not exists public.x_connections (
  player_id text primary key,
  lien_id text not null,
  x_user_id text not null,
  x_username text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.liens
  add column if not exists user_id uuid references public.users(id) on delete set null;

create or replace function public.resolve_telegram_identity(
  target_telegram_user_id text,
  target_lien_id text,
  target_lien_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_user_id uuid;
begin
  if target_telegram_user_id !~ '^[0-9]+$' then
    raise exception 'Invalid Telegram user ID';
  end if;
  if target_lien_id !~ '^LIEN-[A-Z0-9]+$' then
    raise exception 'Invalid LIEN ID';
  end if;

  select user_id into resolved_user_id
  from public.auth_identities
  where provider = 'telegram'
    and provider_user_id = target_telegram_user_id
  for update;

  if resolved_user_id is null then
    select user_id into resolved_user_id
    from public.lien_profiles
    where lien_id = target_lien_id
    for update;
  end if;

  if resolved_user_id is null then
    insert into public.users default values
    returning id into resolved_user_id;
  end if;

  insert into public.auth_identities(
    user_id, provider, provider_user_id, verified_at, updated_at
  )
  values (
    resolved_user_id, 'telegram', target_telegram_user_id, now(), now()
  )
  on conflict (provider, provider_user_id) do update
  set verified_at = now(), updated_at = now()
  where public.auth_identities.user_id = excluded.user_id;

  if not exists (
    select 1 from public.auth_identities
    where provider = 'telegram'
      and provider_user_id = target_telegram_user_id
      and user_id = resolved_user_id
  ) then
    raise exception 'Telegram identity is already attached to another LIEN account';
  end if;

  insert into public.lien_profiles(user_id, lien_id, lien_name, updated_at)
  values (
    resolved_user_id,
    target_lien_id,
    left(coalesce(nullif(trim(target_lien_name), ''), 'Ascender'), 80),
    now()
  )
  on conflict (user_id) do update
  set lien_name = excluded.lien_name, updated_at = now()
  where public.lien_profiles.lien_id = excluded.lien_id;

  if not exists (
    select 1 from public.lien_profiles
    where user_id = resolved_user_id and lien_id = target_lien_id
  ) then
    raise exception 'LIEN ID is already attached to another permanent account';
  end if;

  update public.liens
  set user_id = resolved_user_id
  where lien_id = target_lien_id
    and (user_id is null or user_id = resolved_user_id);

  return resolved_user_id;
end;
$$;

revoke all on function public.resolve_telegram_identity(text, text, text) from public;
revoke all on function public.resolve_telegram_identity(text, text, text) from anon;
revoke all on function public.resolve_telegram_identity(text, text, text) from authenticated;
grant execute on function public.resolve_telegram_identity(text, text, text) to service_role;

create or replace view public.identity_migration_status
with (security_invoker = true)
as
select
  count(*) as total_lien_records,
  count(*) filter (where user_id is not null) as migrated_lien_records,
  count(*) filter (where user_id is null) as pending_lien_records
from public.liens;

alter table public.x_connections enable row level security;
