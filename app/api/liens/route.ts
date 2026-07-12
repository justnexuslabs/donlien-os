import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  assertSameOrigin,
  getClientKey,
  lienSchema,
  logEvent,
  makeLienId,
  rateLimit,
} from "@/lib/security";
import { sanitizeUserText } from "@/lib/naming";
import { notifyLienWebhook } from "@/lib/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limited = rateLimit(await getClientKey("liens"), 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
  }

  const parsed = lienSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid LIEN identity payload." }, { status: 400 });
  }

  const lienId = makeLienId();
  const record = {
    lien_id: lienId,
    human_name: sanitizeUserText(parsed.data.humanName),
    lien_name: sanitizeUserText(parsed.data.lienName),
    role: parsed.data.role,
    portrait_url: null,
    portrait_data_url: null,
    genesis_status: parsed.data.genesisStatus,
    x_post_url: parsed.data.xPostUrl || null,
    signup_stage: "activation",
    signup_completed: true,
    last_activity_at: new Date().toISOString(),
    webhook_status: "not_sent",
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    logEvent("lien_save_skipped_missing_supabase", { role: record.role });
    return NextResponse.json({
      saved: false,
      warning: "Supabase service role is not configured; identity was not persisted.",
      lienId,
      lienName: record.lien_name,
    });
  }

  const { error } = await supabase.from("liens").insert(record);
  if (error) {
    logEvent("lien_save_failed", { role: record.role, reason: error.code });
    return NextResponse.json({ error: "Unable to save LIEN identity." }, { status: 500 });
  }

  const webhookStatus = await notifyLienWebhook({
    event: "lien_saved",
    lienId,
    lienName: record.lien_name,
    role: record.role,
    genesisStatus: record.genesis_status,
  });
  await supabase.from("liens").update({ webhook_status: webhookStatus }).eq("lien_id", lienId);

  logEvent("lien_saved", { role: record.role, lienId, webhookStatus });
  return NextResponse.json({ saved: true, lienId, lienName: record.lien_name, webhookStatus });
}

export async function GET() {
  return NextResponse.json({ error: "Public LIEN enumeration is disabled." }, { status: 403 });
}
