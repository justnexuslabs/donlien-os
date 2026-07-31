create table if not exists public.lien_role_definitions (
  season_id text not null,
  role_id text not null,
  version text not null,
  display_name text not null,
  purpose text not null,
  emblem text not null,
  outfit_direction text not null,
  background_theme text not null,
  signature_effect text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (season_id, role_id, version)
);

insert into public.lien_role_definitions
  (season_id, role_id, version, display_name, purpose, emblem, outfit_direction, background_theme, signature_effect)
values
  ('S01', 'guardian', 's01.v1', 'Guardian', 'Protects and strengthens the community.', 'Living shield around a central star', 'Defensive ceremonial armor', 'Secure LIEN gateway', 'Energy shield'),
  ('S01', 'strategist', 's01.v1', 'Strategist', 'Plans, analyzes, and leads missions.', 'Three-point signal compass', 'Tactical command coat', 'Orbital command chamber', 'Holographic map'),
  ('S01', 'builder', 's01.v1', 'Builder', 'Develops tools, systems, and ecosystem infrastructure.', 'Interlocking orbital frame', 'Utility engineering exosuit', 'Orbital construction bay', 'Digital construction grid'),
  ('S01', 'creator', 's01.v1', 'Creator', 'Produces art, media, stories, and culture.', 'Radiant prism spark', 'Expressive creative-tech jacket', 'Future media atelier', 'Colorful data particles')
on conflict (season_id, role_id, version) do update set
  display_name = excluded.display_name,
  purpose = excluded.purpose,
  emblem = excluded.emblem,
  outfit_direction = excluded.outfit_direction,
  background_theme = excluded.background_theme,
  signature_effect = excluded.signature_effect,
  active = true;

alter table public.liens add column if not exists role_id text;
alter table public.liens add column if not exists role_version text;

update public.liens
set role_id = lower(role),
    role_version = case
      when lower(role) in ('guardian', 'strategist', 'builder', 'creator') then 's01.v1'
      else 'legacy.v1'
    end
where role_id is null or role_version is null;

create table if not exists public.lien_season_roles (
  lien_id text not null references public.liens(lien_id) on delete cascade,
  season_id text not null,
  role_id text not null,
  role_version text not null,
  assigned_at timestamptz not null default now(),
  primary key (lien_id, season_id),
  foreign key (season_id, role_id, role_version)
    references public.lien_role_definitions(season_id, role_id, version)
);

insert into public.lien_season_roles (lien_id, season_id, role_id, role_version)
select lien_id, 'S01', role_id, role_version
from public.liens
where role_id in ('guardian', 'strategist', 'builder', 'creator')
  and role_version = 's01.v1'
on conflict (lien_id, season_id) do nothing;

alter table public.lien_role_definitions enable row level security;
alter table public.lien_season_roles enable row level security;
revoke all on public.lien_role_definitions from anon, authenticated;
revoke all on public.lien_season_roles from anon, authenticated;

create index if not exists lien_season_roles_lookup_idx
  on public.lien_season_roles(season_id, role_id, role_version);
