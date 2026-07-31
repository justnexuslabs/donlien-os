-- A Holographic card earns Genesis LIENFT whitelist eligibility only after
-- its server-verified paid generation completes. Refunded/failed orders are
-- excluded automatically. This view is service-role only so card screenshots
-- and browser-supplied edition values cannot be used as proof of eligibility.
create or replace view public.genesis_lienft_whitelist
with (security_invoker = true)
as
select distinct on (po.user_id)
  po.user_id,
  po.lien_id,
  po.id as qualifying_order_id,
  po.payment_intent_id,
  po.completed_at,
  true as eligible
from (
  select
    purchase_orders.*,
    generation_jobs.completed_at
  from public.purchase_orders
  join public.generation_jobs on generation_jobs.order_id = purchase_orders.id
  where purchase_orders.edition = 'holographic'
    and purchase_orders.status = 'completed'
    and generation_jobs.status = 'completed'
) po
order by po.user_id, po.completed_at asc;

revoke all on public.genesis_lienft_whitelist from public, anon, authenticated;
grant select on public.genesis_lienft_whitelist to service_role;
