import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createLienSession, readLienSessionDetails, type LienProfile } from "@/lib/lien-session";
import { applyAuthoritativeRole } from "@/lib/authoritative-role";
import type { MissionControlSnapshot } from "@/lib/mission-control";

export const runtime = "nodejs";

export async function GET() {
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session) return NextResponse.json({ error: "LIEN session required." }, { status: 401 });
  const secret = process.env.LIEN_BRIDGE_SECRET;
  if (!secret) return NextResponse.json({ error: "LIEN bridge is not configured." }, { status: 503 });

  const timestamp = String(Date.now());
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}:${session.legacyPlayerId}`)
    .digest("hex");
  const response = await fetch(
    process.env.LIEN_ASCENSION_API ||
      "https://lien-ascension.netlify.app/api/website-profile",
    {
      method: "POST",
      headers: {
        "x-lien-timestamp": timestamp,
        "x-lien-player": session.legacyPlayerId,
        "x-lien-signature": signature,
      },
      cache: "no-store",
    },
  );
  const data = (await response.json()) as { profile?: LienProfile; missionControl?: MissionControlSnapshot; error?: string };
  if (!response.ok || !data.profile) {
    return NextResponse.json({ error: data.error || "Unable to refresh LIEN profile." }, { status: response.status });
  }

  const profile = await applyAuthoritativeRole(data.profile);
  const result = NextResponse.json({ profile, missionControl: data.missionControl || { rank: null, transactions: [] } });
  result.cookies.set(
    "lien_session",
    createLienSession(
      profile,
      session.userId
        ? { userId: session.userId, legacyPlayerId: session.legacyPlayerId }
        : session.legacyPlayerId,
    ),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    },
  );
  return result;
}
