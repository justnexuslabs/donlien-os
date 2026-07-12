import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { adminLienQuerySchema, getSignupState, hasAdminSession, logEvent } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ records: [], warning: "Supabase is not configured." });
  }
  const url = new URL(request.url);
  const parsed = adminLienQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin filters." }, { status: 400 });
  }

  let query = supabase
    .from("liens")
    .select("lien_id,human_name,lien_name,role,genesis_status,signup_stage,signup_completed,last_activity_at,abandoned_at,webhook_status,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (parsed.data.role) query = query.eq("role", parsed.data.role);
  if (parsed.data.status) query = query.eq("genesis_status", parsed.data.status);
  if (parsed.data.from) query = query.gte("created_at", parsed.data.from);
  if (parsed.data.to) query = query.lte("created_at", parsed.data.to);

  const { data, error } = await query;
  if (error) {
    logEvent("admin_liens_failed", { reason: error.code });
    return NextResponse.json({ error: "Unable to load admin records." }, { status: 500 });
  }

  const records = (data || []).map((record) => ({
    ...record,
    signup_state: getSignupState(record),
  }));

  return NextResponse.json({
    records,
    count: records.length,
    abandonmentRule: "Incomplete signup records are considered abandoned after 24 hours without activity.",
  });
}
