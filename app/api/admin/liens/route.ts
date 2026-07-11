import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hasAdminSession, logEvent } from "@/lib/security";

export const runtime = "nodejs";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ records: [], warning: "Supabase is not configured." });
  }
  const { data, error } = await supabase
    .from("liens")
    .select("lien_id,human_name,lien_name,role,genesis_status,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    logEvent("admin_liens_failed", { reason: error.code });
    return NextResponse.json({ error: "Unable to load admin records." }, { status: 500 });
  }
  return NextResponse.json({ records: data || [] });
}
