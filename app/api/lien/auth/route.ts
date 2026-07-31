import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { createLienSession, type LienProfile } from "@/lib/lien-session";
import { resolveTelegramIdentity } from "@/lib/permanent-identity";
import { verifyTelegramLogin } from "@/lib/telegram-login";

export const runtime = "nodejs";

function websiteUrl(path: string) {
  const origin =
    process.env.LIEN_WEBSITE_URL ||
    process.env.URL ||
    "https://donlien.xyz";
  return new URL(path, origin);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const user = verifyTelegramLogin(url.searchParams);
    const secret = process.env.LIEN_BRIDGE_SECRET;
    if (!secret) throw new Error("LIEN bridge is not configured");
    const timestamp = String(Date.now());
    const signature = createHmac("sha256", secret)
      .update(`${timestamp}:${user.id}`)
      .digest("hex");
    const response = await fetch(
      process.env.LIEN_ASCENSION_API || "https://lien-ascension.netlify.app/api/website-profile",
      {
        method: "POST",
        headers: {
          "x-lien-timestamp": timestamp,
          "x-lien-player": user.id,
          "x-lien-signature": signature,
        },
        cache: "no-store",
      },
    );
    const data = (await response.json()) as { profile?: LienProfile; error?: string };
    if (!response.ok || !data.profile) throw new Error(data.error || "Unable to load LIEN profile");
    const identity = await resolveTelegramIdentity(
      user.id,
      data.profile.lienId,
      data.profile.lienName,
    );

    const redirect = NextResponse.redirect(websiteUrl("/lien-id"));
    redirect.cookies.set("lien_session", createLienSession(data.profile, identity), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });
    return redirect;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.redirect(
      websiteUrl(`/lien-id?error=${encodeURIComponent(message)}`),
    );
  }
}
