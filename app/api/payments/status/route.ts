import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readLienSessionDetails } from "@/lib/lien-session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session?.userId) return NextResponse.json({ error: "Connect Telegram first." }, { status: 401 });
  const generationSessionId = new URL(request.url).searchParams.get("sessionId")?.trim();
  if (!generationSessionId || generationSessionId.length > 128) return NextResponse.json({ error: "Invalid generation session." }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Order status is not configured." }, { status: 503 });
  const { data, error } = await supabase.from("purchase_orders")
    .select("status,edition,amount_cents,created_at,updated_at")
    .eq("user_id", session.userId)
    .eq("generation_session_id", generationSessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Order status could not be read." }, { status: 500 });
  return NextResponse.json({ order: data || null });
}
