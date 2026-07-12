import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  assertSameOrigin,
  getClientKey,
  logEvent,
  rateLimit,
  signupEventSchema,
} from "@/lib/security";
import { sanitizeUserText } from "@/lib/naming";
import { notifyLienWebhook } from "@/lib/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limited = rateLimit(await getClientKey("signup-events"), 60, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
  }
  const parsed = signupEventSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup event." }, { status: 400 });
  }

  const payload = parsed.data;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    logEvent("signup_event_skipped_missing_supabase", { stage: payload.stage });
    return NextResponse.json({ tracked: false, warning: "Supabase is not configured." });
  }

  const event = {
    session_id: payload.sessionId,
    stage: payload.stage,
    human_name: payload.humanName ? sanitizeUserText(payload.humanName) : null,
    lien_name: payload.lienName ? sanitizeUserText(payload.lienName) : null,
    role: payload.role || null,
    lien_id: payload.lienId || null,
    completed: payload.completed,
    occurred_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("signup_events").insert(event);
  if (error) {
    logEvent("signup_event_failed", { stage: payload.stage, reason: error.code });
    return NextResponse.json({ error: "Unable to track signup event." }, { status: 500 });
  }

  const webhookStatus = payload.completed
    ? await notifyLienWebhook({
        event: "signup_stage",
        lienId: payload.lienId,
        lienName: payload.lienName,
        role: payload.role,
        signupStage: payload.stage,
        completed: payload.completed,
      })
    : "not_sent";

  logEvent("signup_event_tracked", { stage: payload.stage, completed: payload.completed, webhookStatus });
  return NextResponse.json({ tracked: true, webhookStatus });
}
