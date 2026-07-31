import { NextResponse } from "next/server";
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

  const holographic = parsed.data.edition === "holographic";
  const amount = holographic ? "700" : "300";
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
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = (await response.json()) as { url?: string; error?: { message?: string } };

  if (!response.ok || !payload.url) {
    logEvent("checkout_create_failed", { status: response.status, message: payload.error?.message?.slice(0, 120) });
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 502 });
  }

  logEvent("checkout_created", {
    product: "pixel_lien_id_generation",
    edition: parsed.data.edition,
    amount: Number(amount),
  });
  return NextResponse.json({ url: payload.url });
}
