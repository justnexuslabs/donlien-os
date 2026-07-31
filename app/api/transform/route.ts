import OpenAI, { toFile } from "openai";
import { Jimp, ResizeStrategy } from "jimp";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  getClientKey,
  hasAdminSession,
  isPermanentLienAdmin,
  logEvent,
  rateLimit,
  transformFieldsSchema,
  validatePortrait,
} from "@/lib/security";
import { readLienSessionDetails } from "@/lib/lien-session";
import { getGenerationAccess, recordSuccessfulGeneration } from "@/lib/generation";
import { makeLienName } from "@/lib/naming";
import { roleProfiles } from "@/lib/content";

export const runtime = "nodejs";

function getOpenAIConfig() {
  const imageModel = process.env.OPENAI_IMAGE_MODEL;
  const fallbackModel = "gpt-image-1-mini";
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_IMAGE_API_KEY ||
    process.env.OPENAI_AI_KEY ||
    process.env.openAI_api ||
    (imageModel?.startsWith("sk-") ? imageModel : undefined);

  return {
    apiKey,
    model: imageModel && !imageModel.startsWith("sk-") ? imageModel : fallbackModel,
    modelMisconfigured: Boolean(imageModel?.startsWith("sk-")),
  };
}

function getOpenAIErrorDetails(error: unknown) {
  const openAIError = error as {
    code?: string;
    error?: { code?: string; type?: string };
    message?: string;
    status?: number;
    type?: string;
  };
  const message = openAIError.message || "Unknown OpenAI error";
  const code = openAIError.code || openAIError.error?.code || openAIError.type || openAIError.error?.type || "openai_error";
  return {
    code,
    message,
    status: openAIError.status,
  };
}

function shouldRetryWithStandardImageModel(error: unknown) {
  const details = getOpenAIErrorDetails(error);
  const joined = `${details.code} ${details.message}`.toLowerCase();
  return (
    joined.includes("model") &&
    (joined.includes("not found") ||
      joined.includes("does not exist") ||
      joined.includes("unsupported") ||
      joined.includes("access"))
  );
}

function getPublicOpenAIError(error: unknown) {
  const details = getOpenAIErrorDetails(error);
  const joined = `${details.code} ${details.message}`.toLowerCase();

  if (details.status === 401 || joined.includes("invalid_api_key") || joined.includes("incorrect api key")) {
    return "OpenAI rejected the API key. Create a fresh key and set it as OPENAI_API_KEY in Netlify production.";
  }

  if (details.status === 429 || joined.includes("quota") || joined.includes("billing") || joined.includes("insufficient")) {
    return "OpenAI rejected the request for quota or billing. Check credits, spend limit, and project billing.";
  }

  if (joined.includes("model")) {
    return "OpenAI rejected the image model. Use OPENAI_IMAGE_MODEL=gpt-image-1-mini or gpt-image-1.";
  }

  return "OpenAI image generation failed. Check the API key, billing, and image model env settings.";
}

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const lienSession = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  const adminBypass =
    (await hasAdminSession()) || isPermanentLienAdmin(lienSession?.profile.lienId);
  const formData = await request.formData();
  const parsed = transformFieldsSchema.safeParse({
    sessionId: formData.get("sessionId"),
    humanName: formData.get("humanName"),
    role: formData.get("role"),
    edition: formData.get("edition"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid transform request." }, { status: 400 });
  }

  if (!adminBypass) {
    const sessionLimited = await rateLimit(`transform_session:${parsed.data.sessionId}`, 20, 60 * 60 * 1000);
    const ipLimited = await rateLimit(await getClientKey("transform_ip"), 100, 60 * 60 * 1000);
    if (!sessionLimited.ok || !ipLimited.ok) {
      return NextResponse.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
    }
  }

  if (!adminBypass) {
    const access = await getGenerationAccess(parsed.data.sessionId, parsed.data.edition);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.error, paymentRequired: "paymentRequired" in access ? access.paymentRequired : false },
        { status: "paymentRequired" in access && access.paymentRequired ? 402 : 503 },
      );
    }
  }

  const portrait = formData.get("portrait");
  if (!(portrait instanceof File)) {
    return NextResponse.json({ error: "Portrait is required." }, { status: 400 });
  }

  const portraitCheck = await validatePortrait(portrait);
  if (!portraitCheck.ok) {
    return NextResponse.json({ error: portraitCheck.error }, { status: 400 });
  }

  const openAIConfig = getOpenAIConfig();

  if (!openAIConfig.apiKey) {
    logEvent("transform_missing_openai_key", { role: parsed.data.role });
    return NextResponse.json(
      {
        error: "OpenAI image generation is not configured yet.",
        lienName: makeLienName(parsed.data.humanName),
      },
      { status: 503 },
    );
  }

  if (openAIConfig.modelMisconfigured) {
    logEvent("transform_openai_model_env_contains_key", { role: parsed.data.role });
  }

  const lienName = makeLienName(parsed.data.humanName);
  const roleProfile = roleProfiles[parsed.data.role];
  const prompt = [
    "Create one shoulders-up DonLien character portrait using the uploaded photo as the identity reference.",
    "PORTRAIT ONLY. Do not create a trading card, ID card, poster, badge, border, frame, interface, nameplate, caption, logo, seal, or document.",
    "ABSOLUTELY NO TEXT: no letters, words, names, numbers, levels, IDs, typography, symbols that resemble writing, watermarks, signatures, or branding anywhere in the image.",
    "The uploaded person's likeness is the priority: keep their head angle, face proportions, jawline, nose bridge, mouth shape, brow shape, hairline, expression, and camera framing recognizable.",
    "Do not replace the subject with a generic alien mascot. Do not invent a new face. This must read as the uploaded person transformed into a DonLien form.",
    "Render as crisp premium pixel portrait art, like a 128x128 character portrait intentionally upscaled with sharp square pixels.",
    "Apply subtle DonLien traits: controlled alien-green skin tint and glossy dark almond eyes while retaining the original face structure and expression.",
    `LIEN path: ${roleProfile.title}.`,
    `Path meaning: ${roleProfile.purpose}`,
    `Personal charge embodied by the portrait: ${roleProfile.charge}`,
    `Role traits to communicate through expression, posture, and design: ${roleProfile.traits.join(", ")}.`,
    `Required role insignia: ${roleProfile.insignia}.`,
    `Required role palette: ${roleProfile.palette}.`,
    `Required portrait pose and expression: ${roleProfile.poseDirection}.`,
    `Required outfit direction: ${roleProfile.outfitDirection}.`,
    `Required background environment: ${roleProfile.backgroundTheme}.`,
    `Required signature visual effect: ${roleProfile.signatureEffect}.`,
    roleProfile.visualPrompt,
    `Do not borrow clothing, symbols, staging, or visual motifs from any of the other LIEN paths. This must be unmistakably ${parsed.data.role}.`,
    "Keep the composition centered and shoulders-up with safe space around the head. The website will add the official card frame and identity data afterward.",
    "No blur, no painterly shading, no photorealism. No earrings, random jewelry, extra people, duplicate faces, text, or card elements.",
  ].join(" ");

  const client = new OpenAI({ apiKey: openAIConfig.apiKey });
  const file = await toFile(Buffer.from(await portrait.arrayBuffer()), portrait.name || "portrait.png", {
    type: portrait.type,
  });

  let image;
  let modelUsed = openAIConfig.model;
  try {
    image = await client.images.edit({
      model: modelUsed,
      image: file,
      prompt,
      quality: "low",
      size: "auto",
    });
  } catch (error) {
    if (modelUsed !== "gpt-image-1" && shouldRetryWithStandardImageModel(error)) {
      logEvent("transform_openai_model_retry", {
        role: parsed.data.role,
        fromModel: modelUsed,
        toModel: "gpt-image-1",
      });
      try {
        modelUsed = "gpt-image-1";
        image = await client.images.edit({
          model: modelUsed,
          image: file,
          prompt,
          quality: "low",
          size: "auto",
        });
      } catch (retryError) {
        const details = getOpenAIErrorDetails(retryError);
        logEvent("transform_openai_error", {
          role: parsed.data.role,
          code: details.code,
          status: details.status,
          message: details.message.slice(0, 160),
        });
        return NextResponse.json(
          {
            error: getPublicOpenAIError(retryError),
            lienName: makeLienName(parsed.data.humanName),
          },
          { status: 502 },
        );
      }
    } else {
      const details = getOpenAIErrorDetails(error);
      logEvent("transform_openai_error", {
        role: parsed.data.role,
        code: details.code,
        status: details.status,
        message: details.message.slice(0, 160),
      });
      return NextResponse.json(
        {
          error: getPublicOpenAIError(error),
          lienName: makeLienName(parsed.data.humanName),
        },
        { status: 502 },
      );
    }
  }

  const b64 = image.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: "Image generation did not return image data." }, { status: 502 });
  }

  const pixelImage = await Jimp.read(Buffer.from(b64, "base64"));
  pixelImage.cover({ w: 160, h: 200 });
  pixelImage.resize({
    w: 800,
    h: 1000,
    mode: ResizeStrategy.NEAREST_NEIGHBOR,
  });
  const pixelPortrait = await pixelImage.getBuffer("image/png");

  if (!adminBypass) {
    await recordSuccessfulGeneration(parsed.data.sessionId, parsed.data.edition);
  }
  logEvent("transform_complete", { role: parsed.data.role, bytes: portrait.size, model: modelUsed });
  return NextResponse.json({
    lienName,
    edition: parsed.data.edition,
    imageDataUrl: `data:image/png;base64,${pixelPortrait.toString("base64")}`,
  });
}
