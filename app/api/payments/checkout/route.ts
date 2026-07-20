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
  const priceId = process.env.STRIPE_IMAGE_CREDIT_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (!secretKey || !priceId) {
    logEvent("checkout_missing_stripe_config");
    return NextResponse.json({ error: "Paid retries are not configured yet." }, { status: 503 });
  }

  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${siteUrl.replace(/\/$/, "")}/become-a-lien?payment=success`,
    cancel_url: `${siteUrl.replace(/\/$/, "")}/become-a-lien?payment=cancelled`,
    client_reference_id: parsed.data.sessionId,
    "metadata[session_id]": parsed.data.sessionId,
    "metadata[product]": "donlien_image_retry",
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

  logEvent("checkout_created", { product: "donlien_image_retry" });
  return NextResponse.json({ url: payload.url });
}
