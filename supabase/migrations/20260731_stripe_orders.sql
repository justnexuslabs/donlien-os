create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  lien_id text not null,
  generation_session_id text not null,
  checkout_session_id text not null unique,
  payment_intent_id text unique,
  edition text not null check (edition in ('standard', 'holographic')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'queued', 'generating', 'needs_review', 'completed', 'failed', 'refunded')),
  failure_message text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.purchase_orders(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  edition text not null check (edition in ('standard', 'holographic')),
  status text not null default 'queued' check (status in ('queued', 'generating', 'needs_review', 'completed', 'failed')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 2),
  source_upload_path text,
  generated_portrait_path text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  checkout_session_id text not null,
  processed_at timestamptz not null default now()
);

create index if not exists purchase_orders_user_created_idx on public.purchase_orders(user_id, created_at desc);
create index if not exists purchase_orders_status_idx on public.purchase_orders(status, updated_at);
create index if not exists generation_jobs_status_idx on public.generation_jobs(status, updated_at);

alter table public.purchase_orders enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.stripe_webhook_events enable row level security;

create or replace function public.confirm_stripe_purchase(
  target_event_id text, target_checkout_session_id text, target_payment_intent_id text,
  target_generation_session_id text, target_user_id uuid, target_lien_id text,
  target_edition text, target_amount_cents integer, target_currency text
)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  expected_amount integer;
  order_record public.purchase_orders%rowtype;
  inserted_event integer;
  newly_paid boolean := false;
begin
  expected_amount := case target_edition when 'standard' then 300 when 'holographic' then 700 else null end;
  if expected_amount is null or target_amount_cents <> expected_amount or lower(target_currency) <> 'usd' then
    raise exception 'Stripe purchase amount, currency, or edition mismatch';
  end if;
  insert into public.stripe_webhook_events(event_id, event_type, checkout_session_id)
  values (target_event_id, 'checkout.payment_confirmed', target_checkout_session_id)
  on conflict (event_id) do nothing;
  get diagnostics inserted_event = row_count;
  if inserted_event = 0 then return false; end if;
  select * into order_record from public.purchase_orders where checkout_session_id = target_checkout_session_id for update;
  if order_record.id is null then
    insert into public.purchase_orders(user_id, lien_id, generation_session_id, checkout_session_id, payment_intent_id, edition, amount_cents, currency, status, paid_at, updated_at)
    values (target_user_id, target_lien_id, target_generation_session_id, target_checkout_session_id, target_payment_intent_id, target_edition, target_amount_cents, lower(target_currency), 'queued', now(), now())
    returning * into order_record;
    newly_paid := true;
  else
    if order_record.user_id <> target_user_id or order_record.lien_id <> target_lien_id or order_record.edition <> target_edition or order_record.amount_cents <> target_amount_cents then
      raise exception 'Stripe metadata does not match pending order';
    end if;
    if order_record.status = 'pending_payment' then
      update public.purchase_orders set payment_intent_id = target_payment_intent_id, status = 'queued', paid_at = now(), updated_at = now() where id = order_record.id;
      newly_paid := true;
    end if;
  end if;
  insert into public.generation_jobs(order_id, user_id, edition, status)
  values (order_record.id, target_user_id, target_edition, 'queued') on conflict (order_id) do nothing;
  if newly_paid then perform public.add_generation_credits(target_generation_session_id, target_edition, 1); end if;
  return true;
end;
$$;

create or replace function public.complete_generation_purchase(target_session_id text, target_edition text)
returns void language plpgsql security definer set search_path = public as $$
declare target_job_id uuid; target_order_id uuid;
begin
  if target_edition not in ('standard', 'holographic') then raise exception 'Invalid card edition'; end if;
  update public.generation_sessions set
    standard_credits = case when target_edition = 'standard' then greatest(standard_credits - 1, 0) else standard_credits end,
    holographic_credits = case when target_edition = 'holographic' then greatest(holographic_credits - 1, 0) else holographic_credits end,
    paid_generations_used = paid_generations_used + 1, updated_at = now()
  where session_id = target_session_id;
  select gj.id, gj.order_id into target_job_id, target_order_id from public.generation_jobs gj
  join public.purchase_orders po on po.id = gj.order_id
  where po.generation_session_id = target_session_id and gj.edition = target_edition and gj.status in ('queued', 'generating')
  order by gj.created_at asc limit 1 for update of gj;
  if target_job_id is not null then
    update public.generation_jobs set status = 'completed', attempt_count = greatest(attempt_count, 1), completed_at = now(), updated_at = now(), error_message = null where id = target_job_id;
    update public.purchase_orders set status = 'completed', updated_at = now() where id = target_order_id;
  end if;
end;
$$;

revoke execute on function public.add_generation_credits(text, text, integer) from public, anon, authenticated;
revoke execute on function public.confirm_stripe_purchase(text, text, text, text, uuid, text, text, integer, text) from public, anon, authenticated;
revoke execute on function public.complete_generation_purchase(text, text) from public, anon, authenticated;
revoke execute on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.add_generation_credits(text, text, integer) to service_role;
grant execute on function public.confirm_stripe_purchase(text, text, text, text, uuid, text, text, integer, text) to service_role;
grant execute on function public.complete_generation_purchase(text, text) to service_role;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
