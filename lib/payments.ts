import { getSupabaseAdmin } from "./supabase";
import { logEvent } from "./security";

export const LIEN_EDITION_PRICES = {
  standard: 300,
  holographic: 700,
} as const;

export type LienEdition = keyof typeof LIEN_EDITION_PRICES;

export async function createPendingOrder(input: {
  checkoutSessionId: string;
  generationSessionId: string;
  userId: string;
  lienId: string;
  edition: LienEdition;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Order storage is not configured." };

  const { error } = await supabase.from("purchase_orders").insert({
    user_id: input.userId,
    lien_id: input.lienId,
    generation_session_id: input.generationSessionId,
    checkout_session_id: input.checkoutSessionId,
    edition: input.edition,
    amount_cents: LIEN_EDITION_PRICES[input.edition],
    currency: "usd",
    status: "pending_payment",
  });

  if (error) {
    logEvent("purchase_order_create_failed", { reason: error.code });
    return { ok: false as const, error: "The paid order could not be secured." };
  }
  return { ok: true as const };
}

export async function confirmStripePurchase(input: {
  eventId: string;
  checkoutSessionId: string;
  paymentIntentId?: string;
  generationSessionId: string;
  userId: string;
  lienId: string;
  edition: LienEdition;
  amountCents: number;
  currency: string;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Order storage is not configured." };

  const { data, error } = await supabase.rpc("confirm_stripe_purchase", {
    target_event_id: input.eventId,
    target_checkout_session_id: input.checkoutSessionId,
    target_payment_intent_id: input.paymentIntentId || null,
    target_generation_session_id: input.generationSessionId,
    target_user_id: input.userId,
    target_lien_id: input.lienId,
    target_edition: input.edition,
    target_amount_cents: input.amountCents,
    target_currency: input.currency.toLowerCase(),
  });

  if (error) {
    logEvent("stripe_purchase_record_failed", { reason: error.code });
    return { ok: false as const, error: "The paid order could not be recorded." };
  }
  return { ok: true as const, duplicate: data === false };
}
