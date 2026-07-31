import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readLienSessionDetails } from "@/lib/lien-session";
import { encryptXToken, requireXClient, xRedirectUri } from "@/lib/x-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function destination(request: Request, value: string) {
  return new URL(`/lien-id?x=${encodeURIComponent(value)}`, request.url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const session = readLienSessionDetails(cookieStore.get("lien_session")?.value);
  const state = cookieStore.get("x_oauth_state")?.value;
  const verifier = cookieStore.get("x_oauth_verifier")?.value;

  if (!session || !state || !verifier || state !== url.searchParams.get("state")) {
    return NextResponse.redirect(destination(request, "invalid"));
  }
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(destination(request, "denied"));

  try {
    const { clientId, clientSecret } = requireXClient();
    const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: xRedirectUri(),
        code_verifier: verifier,
      }),
      cache: "no-store",
    });
    const token = (await tokenResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (!tokenResponse.ok || !token.access_token) throw new Error("Token exchange failed");

    const userResponse = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    const userPayload = (await userResponse.json()) as {
      data?: { id: string; username: string };
    };
    if (!userResponse.ok || !userPayload.data) throw new Error("X profile lookup failed");

    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Database is not configured");
    const { error } = await supabase.from("x_connections").upsert({
      player_id: session.legacyPlayerId,
      lien_id: session.profile.lienId,
      x_user_id: userPayload.data.id,
      x_username: userPayload.data.username,
      access_token: encryptXToken(token.access_token),
      refresh_token: token.refresh_token ? encryptXToken(token.refresh_token) : null,
      expires_at: new Date(Date.now() + (token.expires_in || 7200) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("X connection could not be saved");

    const response = NextResponse.redirect(destination(request, "connected"));
    response.cookies.delete("x_oauth_state");
    response.cookies.delete("x_oauth_verifier");
    return response;
  } catch {
    return NextResponse.redirect(destination(request, "failed"));
  }
}
