create table if not exists public.funnel_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('homepage_view','lien_id_cta_click','telegram_connect_started','telegram_connect_completed','photo_upload_started','photo_upload_completed','role_selected','edition_selected','checkout_started','payment_completed','generation_started','generation_completed','generation_failed','card_viewed','first_mission_started','first_mission_completed')),
  session_id_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.funnel_events enable row level security;
revoke all on public.funnel_events from anon, authenticated;
create index if not exists funnel_events_event_created_idx on public.funnel_events(event_name, created_at desc);

create or replace view public.admin_funnel_summary with (security_invoker = true) as
select event_name, count(*)::bigint as event_count, count(distinct session_id_hash)::bigint as unique_sessions
from public.funnel_events group by event_name;
revoke all on public.admin_funnel_summary from public, anon, authenticated;
