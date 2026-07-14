import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  getClientKey,
  logEvent,
  makeLienId,
  rateLimit,
  transformFieldsSchema,
  validatePortrait,
} from "@/lib/security";
import { makeLienName, sanitizeUserText } from "@/lib/naming";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const limited = rateLimit(await getClientKey("transform"), 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
  }

  const formData = await request.formData();
  const parsed = transformFieldsSchema.safeParse({
    humanName: formData.get("humanName"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid transform request." }, { status: 400 });
  }

  const portrait = formData.get("portrait");
  if (!(portrait instanceof File)) {
    return NextResponse.json({ error: "Portrait is required." }, { status: 400 });
  }

  const portraitCheck = await validatePortrait(portrait);
  if (!portraitCheck.ok) {
    return NextResponse.json({ error: portraitCheck.error }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    logEvent("transform_missing_openai_key", { role: parsed.data.role });
    return NextResponse.json(
      {
        error: "OpenAI image generation is not configured yet.",
        lienId: makeLienId(),
        lienName: makeLienName(parsed.data.humanName),
      },
      { status: 503 },
    );
  }

  const prompt = [
    `Transform ${sanitizeUserText(parsed.data.humanName)} into a canonical DonLien premium pixel avatar.`,
    "Preserve the person's recognizable identity, face shape, expression, and general pose from the uploaded portrait.",
    "Render as crisp collectible pixel art, like a 128x128 avatar intentionally upscaled to 1024x1024 with sharp square pixels.",
    "Use alien-green skin, glossy black almond-shaped eyes, and blonde presidential side-swept DonLien hair.",
    `Role-specific outfit: ${parsed.data.role}. Make the outfit readable and iconic at avatar scale.`,
    "If a tie exists, make it match the outfit with vertical glowing green DONLIEN letters.",
    "Use a clean faction-card background, strong silhouette, high contrast, no blur, no painterly shading, no photorealism.",
    "No earrings. No random jewelry. No text except DONLIEN on the tie when it fits clearly.",
  ].join(" ");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const file = await toFile(Buffer.from(await portrait.arrayBuffer()), portrait.name || "portrait.png", {
    type: portrait.type,
  });

  const image = await client.images.edit({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini",
    image: file,
    prompt,
    size: "1024x1024",
  });

  const b64 = image.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: "Image generation did not return image data." }, { status: 502 });
  }

  logEvent("transform_complete", { role: parsed.data.role, bytes: portrait.size });
  return NextResponse.json({
    lienId: makeLienId(),
    lienName: makeLienName(parsed.data.humanName),
    imageDataUrl: `data:image/png;base64,${b64}`,
  });
}
