import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { adminLienQuerySchema, getSignupState, hasAdminSession, logEvent } from "@/lib/security";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, "\"\"")}"`;
}

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const parsed = adminLienQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin filters." }, { status: 400 });
  }

  let query = supabase
    .from("liens")
    .select("lien_id,human_name,lien_name,role,genesis_status,signup_stage,signup_completed,last_activity_at,webhook_status,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (parsed.data.role) query = query.eq("role", parsed.data.role);
  if (parsed.data.status) query = query.eq("genesis_status", parsed.data.status);
  if (parsed.data.from) query = query.gte("created_at", parsed.data.from);
  if (parsed.data.to) query = query.lte("created_at", parsed.data.to);

  const { data, error } = await query;
  if (error) {
    logEvent("admin_export_failed", { reason: error.code });
    return NextResponse.json({ error: "Unable to export records." }, { status: 500 });
  }

  const headers = [
    "lien_id",
    "human_name",
    "lien_name",
    "role",
    "genesis_status",
    "signup_stage",
    "signup_state",
    "last_activity_at",
    "webhook_status",
    "created_at",
  ];
  const rows = (data || []).map((record) => [
    record.lien_id,
    record.human_name,
    record.lien_name,
    record.role,
    record.genesis_status,
    record.signup_stage,
    getSignupState(record),
    record.last_activity_at,
    record.webhook_status,
    record.created_at,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="donlien-liens-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
