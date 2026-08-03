import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readLienSessionDetails } from "@/lib/lien-session";

export const runtime = "nodejs";

export async function GET() {
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session?.profile.avatarUrl) {
    return NextResponse.json({ error: "LIEN portrait is unavailable." }, { status: 404 });
  }

  let source: URL;
  try {
    source = new URL(session.profile.avatarUrl);
  } catch {
    return NextResponse.json({ error: "Invalid LIEN portrait URL." }, { status: 400 });
  }
  if (
    source.protocol !== "https:" ||
    source.hostname !== "lien-ascension.netlify.app" ||
    source.pathname !== "/api/avatar"
  ) {
    return NextResponse.json({ error: "Untrusted LIEN portrait source." }, { status: 400 });
  }

  const response = await fetch(source, { cache: "no-store" });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Saved LIEN portrait could not be loaded." }, { status: 502 });
  }

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
