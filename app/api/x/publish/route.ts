import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readLienSessionDetails } from "@/lib/lien-session";
import { getXConnection, usableXAccessToken } from "@/lib/x-auth";

export const runtime = "nodejs";

const fields = z.object({
  text: z.string().trim().min(1).max(280),
});

export async function POST(request: Request) {
  if (process.env.X_DIRECT_PUBLISH_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Direct X publishing is currently disabled. Use the free share option." },
      { status: 503 },
    );
  }
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session) return NextResponse.json({ error: "LIEN session required." }, { status: 401 });

  try {
    const form = await request.formData();
    const parsed = fields.safeParse({ text: form.get("text") });
    const image = form.get("image");
    if (!parsed.success || !(image instanceof File) || image.type !== "image/png") {
      return NextResponse.json({ error: "A valid post and PNG card are required." }, { status: 400 });
    }
    if (image.size > 5_000_000) {
      return NextResponse.json({ error: "Card image exceeds X's 5 MB limit." }, { status: 413 });
    }

    const connection = await getXConnection(session.legacyPlayerId);
    if (!connection) return NextResponse.json({ error: "Connect your X account first." }, { status: 401 });
    const token = await usableXAccessToken(connection);
    const mediaResponse = await fetch("https://api.x.com/2/media/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media: Buffer.from(await image.arrayBuffer()).toString("base64"),
        media_category: "tweet_image",
        media_type: "image/png",
        shared: false,
      }),
      cache: "no-store",
    });
    const media = (await mediaResponse.json()) as {
      data?: { id?: string };
      errors?: Array<{ detail?: string }>;
    };
    const mediaId = media.data?.id;
    if (!mediaResponse.ok || !mediaId) {
      throw new Error(media.errors?.[0]?.detail || "X media upload failed");
    }

    const postResponse = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: parsed.data.text,
        media: { media_ids: [mediaId] },
      }),
      cache: "no-store",
    });
    const post = (await postResponse.json()) as {
      data?: { id?: string };
      detail?: string;
    };
    if (!postResponse.ok || !post.data?.id) throw new Error(post.detail || "X post failed");

    return NextResponse.json({
      ok: true,
      postUrl: `https://x.com/${connection.x_username}/status/${post.data.id}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "X publishing failed" },
      { status: 502 },
    );
  }
}
