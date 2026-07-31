import { NextResponse } from "next/server";
import { logEvent } from "@/lib/security";
import { verifyStripeSignature } from "@/lib/stripe";
import { confirmStripePurchase, LIEN_EDITION_PRICES } from "@/lib/payments";

export const runtime = "nodejs";

type StripeCheckoutCompleted = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      client_reference_id?: string | null;
      payment_status?: string;
      amount_total?: number | null;
      currency?: string | null;
      payment_intent?: string | null;
      metadata?: {
        session_id?: string;
        product?: string;
        edition?: string;
        user_id?: string;
        lien_id?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    logEvent("stripe_webhook_missing_secret");
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    logEvent("stripe_webhook_invalid_signature");
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeCheckoutCompleted;
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true });
  }

  const checkout = event.data?.object;
  const sessionId = checkout?.metadata?.session_id || checkout?.client_reference_id;
  const edition = checkout?.metadata?.edition;
  const userId = checkout?.metadata?.user_id;
  const lienId = checkout?.metadata?.lien_id;
  if (
    checkout?.payment_status !== "paid" ||
    checkout.metadata?.product !== "pixel_lien_id_generation" ||
    !sessionId ||
    (edition !== "standard" && edition !== "holographic") ||
    !event.id || !checkout.id || !userId || !lienId ||
    checkout.currency?.toLowerCase() !== "usd" ||
    checkout.amount_total !== LIEN_EDITION_PRICES[edition]
  ) {
    logEvent("stripe_checkout_ignored", { checkoutId: checkout?.id, status: checkout?.payment_status });
    return NextResponse.json({ received: true });
  }

  const recorded = await confirmStripePurchase({
    eventId: event.id,
    checkoutSessionId: checkout.id,
    paymentIntentId: checkout.payment_intent || undefined,
    generationSessionId: sessionId,
    userId,
    lienId,
    edition,
    amountCents: checkout.amount_total,
    currency: checkout.currency,
  });
  if (!recorded.ok) {
    return NextResponse.json({ error: recorded.error }, { status: 500 });
  }

  logEvent("stripe_purchase_confirmed", { checkoutId: checkout.id, duplicate: recorded.duplicate });
  return NextResponse.json({ received: true });
}
