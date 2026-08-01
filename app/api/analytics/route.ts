import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, getClientKey, rateLimit } from "@/lib/security";

const events = new Set(["homepage_view","lien_id_cta_click","telegram_connect_started","telegram_connect_completed","photo_upload_started","photo_upload_completed","role_selected","edition_selected","checkout_started","payment_completed","generation_started","generation_completed","generation_failed","card_viewed","first_mission_started","first_mission_completed"]);

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) return NextResponse.json({ received: false }, { status: 403 });
  const limited = await rateLimit(await getClientKey("analytics"), 120, 60 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ received: false }, { status: 429 });
  const body = await request.json().catch(() => null) as { event?: string; sessionId?: string } | null;
  if (!body?.event || !events.has(body.event) || !body.sessionId || body.sessionId.length > 128) return NextResponse.json({ received: false }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const sessionHash = createHash("sha256").update(body.sessionId).digest("hex");
  if (supabase) await supabase.from("funnel_events").insert({ event_name: body.event, session_id_hash: sessionHash });
  return NextResponse.json({ received: true });
}
