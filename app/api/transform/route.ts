import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  getClientKey,
  hasAdminSession,
  logEvent,
  makeLienId,
  rateLimit,
  transformFieldsSchema,
  validatePortrait,
} from "@/lib/security";
import { getGenerationAccess, recordSuccessfulGeneration } from "@/lib/generation";
import { makeLienName, sanitizeUserText } from "@/lib/naming";

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

  const adminBypass = await hasAdminSession();
  const formData = await request.formData();
  const parsed = transformFieldsSchema.safeParse({
    sessionId: formData.get("sessionId"),
    humanName: formData.get("humanName"),
    role: formData.get("role"),
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
    const access = await getGenerationAccess(parsed.data.sessionId);
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
        lienId: makeLienId(),
        lienName: makeLienName(parsed.data.humanName),
      },
      { status: 503 },
    );
  }

  if (openAIConfig.modelMisconfigured) {
    logEvent("transform_openai_model_env_contains_key", { role: parsed.data.role });
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
            lienId: makeLienId(),
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
          lienId: makeLienId(),
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

  if (!adminBypass) await recordSuccessfulGeneration(parsed.data.sessionId);
  logEvent("transform_complete", { role: parsed.data.role, bytes: portrait.size, model: modelUsed });
  return NextResponse.json({
    lienId: makeLienId(),
    lienName: makeLienName(parsed.data.humanName),
    imageDataUrl: `data:image/png;base64,${b64}`,
  });
}
