import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readLienSessionDetails } from "@/lib/lien-session";
import { requireXClient, xRedirectUri } from "@/lib/x-auth";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.X_DIRECT_PUBLISH_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Direct X publishing is currently disabled. Use the free share option." },
      { status: 503 },
    );
  }
  const cookieStore = await cookies();
  const session = readLienSessionDetails(cookieStore.get("lien_session")?.value);
  if (!session) return NextResponse.json({ error: "Connect LIEN ID first." }, { status: 401 });

  try {
    const { clientId } = requireXClient();
    const state = randomBytes(24).toString("base64url");
    const verifier = randomBytes(48).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const authorize = new URL("https://x.com/i/oauth2/authorize");
    authorize.search = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: xRedirectUri(),
      scope: "tweet.read tweet.write users.read media.write offline.access",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }).toString();

    const response = NextResponse.redirect(authorize);
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 600,
    };
    response.cookies.set("x_oauth_state", state, options);
    response.cookies.set("x_oauth_verifier", verifier, options);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "X connection failed" },
      { status: 503 },
    );
  }
}
