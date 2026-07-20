import { NextResponse } from "next/server";
import { addGenerationCredits } from "@/lib/generation";
import { logEvent } from "@/lib/security";
import { verifyStripeSignature } from "@/lib/stripe";

export const runtime = "nodejs";

type StripeCheckoutCompleted = {
  type?: string;
  data?: {
    object?: {
      id?: string;
      client_reference_id?: string | null;
      payment_status?: string;
      metadata?: {
        session_id?: string;
        product?: string;
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
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const checkout = event.data?.object;
  const sessionId = checkout?.metadata?.session_id || checkout?.client_reference_id;
  if (checkout?.payment_status !== "paid" || checkout.metadata?.product !== "donlien_image_retry" || !sessionId) {
    logEvent("stripe_checkout_ignored", { checkoutId: checkout?.id, status: checkout?.payment_status });
    return NextResponse.json({ received: true });
  }

  const credited = await addGenerationCredits(sessionId, 1);
  if (!credited.ok) {
    return NextResponse.json({ error: credited.error }, { status: 500 });
  }

  logEvent("stripe_generation_credit_added", { checkoutId: checkout.id });
  return NextResponse.json({ received: true });
}
