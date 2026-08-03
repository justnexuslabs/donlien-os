import { createHash, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createLienSession, readLienSessionDetails, type LienProfile } from "@/lib/lien-session";
import { publicRoleSchema } from "@/lib/security";
import { applyAuthoritativeRole } from "@/lib/authoritative-role";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session) {
    return NextResponse.json(
      { error: "Connect your Telegram LIEN ID before saving this portrait." },
      { status: 401 },
    );
  }

  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > 7_000_000) {
    return NextResponse.json({ error: "Portrait is too large." }, { status: 413 });
  }
  try {
    const payload = JSON.parse(body) as { role?: unknown };
    if (!publicRoleSchema.safeParse(payload.role).success) {
      return NextResponse.json(
        { error: "That role cannot be selected during public card creation." },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid portrait payload." }, { status: 400 });
  }
  const secret = process.env.LIEN_BRIDGE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "LIEN bridge is not configured." }, { status: 503 });
  }
  const timestamp = String(Date.now());
  const digest = createHash("sha256").update(body).digest("hex");
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}:${session.legacyPlayerId}:${digest}`)
    .digest("hex");
  const response = await fetch(
    process.env.LIEN_ASCENSION_AVATAR_API ||
      "https://lien-ascension.netlify.app/api/website-avatar",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-lien-timestamp": timestamp,
        "x-lien-player": session.legacyPlayerId,
        "x-lien-body": digest,
        "x-lien-signature": signature,
      },
      body,
      cache: "no-store",
    },
  );
  const data = (await response.json()) as { profile?: LienProfile; error?: string };
  if (!response.ok || !data.profile) {
    return NextResponse.json(
      { error: data.error || "Unable to save LIEN portrait." },
      { status: response.status || 500 },
    );
  }

  const profile = await applyAuthoritativeRole(data.profile);
  const result = NextResponse.json({ saved: true, profile });
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
