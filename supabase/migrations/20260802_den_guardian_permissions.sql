-- DEN Guardian is an earned trust designation. Public creation routes reject
-- it; only the service-role admin endpoint may invoke this audited function.
alter table public.liens add column if not exists role_locked boolean not null default false;

create table if not exists public.lien_role_audit (
  id uuid primary key default gen_random_uuid(),
  lien_id text not null references public.liens(lien_id) on delete cascade,
  previous_role text not null,
  new_role text not null,
  action text not null check (action in ('guardian_assigned','guardian_revoked')),
  reason text not null,
  assigned_by text not null,
  occurred_at timestamptz not null default now()
);

insert into public.lien_role_definitions
  (season_id, role_id, version, display_name, purpose, emblem, outfit_direction, background_theme, signature_effect)
values
  ('S01', 'guardian', 's01.admin.v1', 'DEN Guardian', 'Protects the ecosystem through trusted service and accountable leadership.', 'DEN shield around a central star', 'Official DEN ceremonial armor', 'Secure DEN command gateway', 'Living shield and authority seal')
on conflict (season_id, role_id, version) do update set
  display_name = excluded.display_name,
  purpose = excluded.purpose,
  emblem = excluded.emblem,
  outfit_direction = excluded.outfit_direction,
  background_theme = excluded.background_theme,
  signature_effect = excluded.signature_effect,
  active = true;

create or replace function public.set_den_guardian_status(
  target_lien_id text,
  make_guardian boolean,
  fallback_role text,
  assignment_reason text,
  admin_actor text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  old_role text;
  selected_role text;
  selected_role_id text;
  selected_version text;
begin
  if fallback_role not in ('Builder','Creator','Strategist') then
    raise exception 'Invalid public fallback role';
  end if;
  if length(trim(assignment_reason)) < 3 then
    raise exception 'Assignment reason is required';
  end if;

  select role into old_role from public.liens where lien_id = target_lien_id for update;
  if old_role is null then raise exception 'LIEN identity not found'; end if;

  if make_guardian then
    selected_role := 'DEN Guardian';
    selected_role_id := 'guardian';
    selected_version := 's01.admin.v1';
  else
    selected_role := fallback_role;
    selected_role_id := lower(fallback_role);
    selected_version := 's01.v1';
  end if;

  update public.liens
  set role = selected_role,
      role_id = selected_role_id,
      role_version = selected_version,
      role_locked = make_guardian,
      last_activity_at = now()
  where lien_id = target_lien_id;

  insert into public.lien_season_roles (lien_id, season_id, role_id, role_version, assigned_at)
  values (target_lien_id, 'S01', selected_role_id, selected_version, now())
  on conflict (lien_id, season_id) do update set
    role_id = excluded.role_id,
    role_version = excluded.role_version,
    assigned_at = excluded.assigned_at;

  insert into public.lien_role_audit (lien_id, previous_role, new_role, action, reason, assigned_by)
  values (
    target_lien_id,
    old_role,
    selected_role,
    case when make_guardian then 'guardian_assigned' else 'guardian_revoked' end,
    trim(assignment_reason),
    admin_actor
  );
end;
$$;

revoke all on public.lien_role_audit from anon, authenticated;
revoke all on function public.set_den_guardian_status(text, boolean, text, text, text) from public, anon, authenticated;
grant execute on function public.set_den_guardian_status(text, boolean, text, text, text) to service_role;

create index if not exists lien_role_audit_lien_time_idx
  on public.lien_role_audit(lien_id, occurred_at desc);
