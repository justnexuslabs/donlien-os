import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readLienSessionDetails } from "@/lib/lien-session";
import { getXConnection } from "@/lib/x-auth";

export const runtime = "nodejs";

export async function GET() {
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session) return NextResponse.json({ connected: false }, { status: 401 });
  if (process.env.X_DIRECT_PUBLISH_ENABLED !== "true") {
    return NextResponse.json({
      configured: false,
      connected: false,
      mode: "native-share",
    });
  }
  if (!process.env.X_CLIENT_ID || !process.env.X_CLIENT_SECRET) {
    return NextResponse.json({ connected: false, configured: false });
  }
  try {
    const connection = await getXConnection(session.legacyPlayerId);
    return NextResponse.json({
      configured: true,
      connected: Boolean(connection),
      username: connection?.x_username || null,
    });
  } catch {
    return NextResponse.json({ configured: true, connected: false, databaseReady: false });
  }
}
