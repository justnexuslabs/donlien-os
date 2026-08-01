create unique index if not exists liens_lien_name_unique_ci
  on public.liens (lower(lien_name));
