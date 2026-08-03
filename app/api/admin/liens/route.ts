import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { adminLienQuerySchema, getSignupState, hasLienAdminAccess, logEvent } from "@/lib/security";

export const runtime = "nodejs";

const guardianAssignmentSchema = z.object({
  lienId: z.string().trim().min(8).max(80),
  action: z.enum(["assign_guardian", "revoke_guardian"]),
  fallbackRole: z.enum(["Builder", "Creator", "Strategist"]).default("Strategist"),
  reason: z.string().trim().min(3).max(300),
});

export async function GET(request: Request) {
  if (!(await hasLienAdminAccess())) {
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
    .select("lien_id,human_name,lien_name,role,role_locked,genesis_status,signup_stage,signup_completed,last_activity_at,abandoned_at,webhook_status,created_at")
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

export async function PATCH(request: Request) {
  if (!(await hasLienAdminAccess())) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  const parsed = guardianAssignmentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Guardian assignment request." }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { error } = await supabase.rpc("set_den_guardian_status", {
    target_lien_id: parsed.data.lienId,
    make_guardian: parsed.data.action === "assign_guardian",
    fallback_role: parsed.data.fallbackRole,
    assignment_reason: parsed.data.reason,
    admin_actor: "authorized_admin",
  });
  if (error) {
    logEvent("guardian_assignment_failed", { lienId: parsed.data.lienId, reason: error.code });
    return NextResponse.json({ error: "DEN Guardian status could not be updated." }, { status: 500 });
  }

  logEvent("guardian_assignment_updated", {
    lienId: parsed.data.lienId,
    action: parsed.data.action,
  });
  return NextResponse.json({
    updated: true,
    role: parsed.data.action === "assign_guardian" ? "DEN Guardian" : parsed.data.fallbackRole,
  });
}
