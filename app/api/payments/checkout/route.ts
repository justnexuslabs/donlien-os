import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readLienSessionDetails } from "@/lib/lien-session";
import { createPendingOrder, LIEN_EDITION_PRICES } from "@/lib/payments";
import { assertSameOrigin, checkoutSchema, getClientKey, logEvent, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

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
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": amount,
    "line_items[0][price_data][product_data][name]": productName,
    "line_items[0][price_data][product_data][description]":
      "One AI-generated pixel LIEN identity preview. Saving is optional.",
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

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };

  if (!response.ok || !payload.url || !payload.id) {
    logEvent("checkout_create_failed", { status: response.status, message: payload.error?.message?.slice(0, 120) });
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 502 });
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
  });
  return NextResponse.json({ url: payload.url });
}
