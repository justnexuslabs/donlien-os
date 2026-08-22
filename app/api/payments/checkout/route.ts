import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readLienSessionDetails } from "@/lib/lien-session";
import { createPendingOrder, LIEN_EDITION_PRICES } from "@/lib/payments";
import { assertSameOrigin, checkoutSchema, getClientKey, logEvent, rateLimit } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type StripeErrorPayload = {
  id?: string;
  url?: string;
  error?: {
    code?: string;
    decline_code?: string;
    message?: string;
    request_log_url?: string;
    type?: string;
  };
};

function safeStripeCheckoutError(payload: StripeErrorPayload, status: number) {
  const type = payload.error?.type || "unknown";
  const code = payload.error?.code || "unknown";
  if (status === 401 || type === "invalid_request_error" && code === "api_key_expired") {
    return {
      code: "STRIPE_CREDENTIALS_INVALID",
      error: "Secure checkout is temporarily unavailable. Support has been notified.",
    };
  }
  if (type === "invalid_request_error") {
    return {
      code: "STRIPE_CHECKOUT_CONFIGURATION",
      error: "Secure checkout needs a payment configuration update. Support has been notified.",
    };
  }
  return {
    code: "STRIPE_UNAVAILABLE",
    error: "Stripe checkout is temporarily unavailable. Please try again shortly.",
  };
}

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const limited = await rateLimit(await getClientKey("checkout"), 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429 });
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (!secretKey) {
    logEvent("checkout_missing_stripe_config");
    return NextResponse.json({ error: "Pixel LIEN-ID checkout is not configured yet." }, { status: 503 });
  }

  // Stripe must never receive a customer before the recoverable order store is
  // available. This avoids paid sessions that the application cannot persist.
  if (!getSupabaseAdmin()) {
    logEvent("checkout_missing_order_storage");
    return NextResponse.json(
      { code: "ORDER_STORAGE_UNAVAILABLE", error: "Secure order storage is temporarily unavailable." },
      { status: 503 },
    );
  }

  const lienSession = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!lienSession?.userId || !lienSession.profile.lienId) {
    return NextResponse.json({ error: "Connect your Telegram LIEN ID before checkout." }, { status: 401 });
  }

  const holographic = parsed.data.edition === "holographic";
  const amount = String(LIEN_EDITION_PRICES[parsed.data.edition]);
  const productName = holographic
    ? "Holographic Pixel LIEN-ID Generation"
    : "Standard Pixel LIEN-ID Generation";
  const body = new URLSearchParams({
    mode: "payment",
    "automatic_payment_methods[enabled]": "true",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": amount,
    "line_items[0][price_data][product_data][name]": productName,
    "line_items[0][price_data][product_data][description]":
      holographic
        ? "One AI-generated pixel LIEN identity preview with Holographic card treatment and Genesis LIENFT whitelist eligibility. Eligibility does not guarantee a mint or allocation."
        : "One AI-generated pixel LIEN identity portrait with the Standard Signal seasonal card treatment.",
    "line_items[0][quantity]": "1",
    success_url: `${siteUrl.replace(/\/$/, "")}/become-a-lien?payment=success&checkout_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl.replace(/\/$/, "")}/become-a-lien?payment=cancelled`,
    client_reference_id: parsed.data.sessionId,
    "metadata[session_id]": parsed.data.sessionId,
    "metadata[product]": "pixel_lien_id_generation",
    "metadata[edition]": parsed.data.edition,
    "metadata[user_id]": lienSession.userId,
    "metadata[lien_id]": lienSession.profile.lienId,
    "payment_intent_data[metadata][user_id]": lienSession.userId,
    "payment_intent_data[metadata][lien_id]": lienSession.profile.lienId,
    "payment_intent_data[metadata][edition]": parsed.data.edition,
  });

  let response: Response;
  let payload: StripeErrorPayload;
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    payload = (await response.json()) as StripeErrorPayload;
  } catch (error) {
    logEvent("checkout_stripe_network_failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { code: "STRIPE_NETWORK_ERROR", error: "Stripe could not be reached. Please try again shortly." },
      { status: 503 },
    );
  }

  if (!response.ok || !payload.url || !payload.id) {
    const safeError = safeStripeCheckoutError(payload, response.status);
    logEvent("checkout_create_failed", {
      status: response.status,
      stripeType: payload.error?.type,
      stripeCode: payload.error?.code,
      stripeRequestUrl: payload.error?.request_log_url,
      message: payload.error?.message?.slice(0, 120),
    });
    return NextResponse.json(safeError, { status: 502 });
  }

  const order = await createPendingOrder({
    checkoutSessionId: payload.id,
    generationSessionId: parsed.data.sessionId,
    userId: lienSession.userId,
    lienId: lienSession.profile.lienId,
    edition: parsed.data.edition,
  });
  if (!order.ok) {
    await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(payload.id)}/expire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}` },
    }).catch(() => undefined);
    return NextResponse.json({ error: order.error }, { status: 503 });
  }

  logEvent("checkout_created", {
    product: "pixel_lien_id_generation",
    edition: parsed.data.edition,
    amount: Number(amount),
    paymentMethods: "dynamic_card_and_crypto",
  });
  return NextResponse.json({ url: payload.url });
}
