import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readLienSessionDetails } from "@/lib/lien-session";
import { sanitizeUserText } from "@/lib/naming";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session) return NextResponse.json({ error: "Connect Telegram first." }, { status: 401 });
  const raw = new URL(request.url).searchParams.get("designation") || "";
  if (!/^[A-Za-z0-9_-]{2,40}$/.test(raw)) return NextResponse.json({ available: false, error: "Use 2–40 letters, numbers, underscores, or hyphens." }, { status: 400 });
  const designation = sanitizeUserText(raw);
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Availability check is not configured." }, { status: 503 });
  const { data, error } = await supabase.from("liens").select("lien_id").ilike("lien_name", designation).limit(1);
  if (error) return NextResponse.json({ error: "Availability could not be checked." }, { status: 500 });
  const owned = data?.[0]?.lien_id === session.profile.lienId;
  return NextResponse.json({ designation, available: !data?.length || owned });
}
