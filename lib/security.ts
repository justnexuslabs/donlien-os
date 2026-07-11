import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { genesisStatuses, roles } from "./content";
import { sanitizeUserText } from "./naming";

export const MAX_PORTRAIT_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const buckets = new Map<string, { count: number; resetAt: number }>();

export const roleSchema = z.enum(roles);
export const lienSchema = z.object({
  humanName: z.string().trim().min(1).max(80),
  lienName: z.string().trim().min(1).max(80),
  role: roleSchema,
  portraitUrl: z.string().url().optional(),
  portraitDataUrl: z.string().startsWith("data:image/").max(2_000_000).optional(),
  genesisStatus: z.enum(genesisStatuses).default("candidate"),
  xPostUrl: z.string().url().optional(),
});

export const transformFieldsSchema = z.object({
  humanName: z.string().trim().min(1).max(80),
  role: roleSchema,
});

export const adminLoginSchema = z.object({
  accessCode: z.string().min(24).max(256),
});

export function makeLienId() {
  return `LIEN-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (existing.count >= limit) return { ok: false, remaining: 0 };
  existing.count += 1;
  return { ok: true, remaining: limit - existing.count };
}

export async function getClientKey(scope: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || headerStore.get("x-real-ip") || "local"}`;
}

export async function assertSameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function validatePortrait(file: File) {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { ok: false as const, error: "Portrait must be JPG, PNG, or WEBP." };
  }
  if (file.size > MAX_PORTRAIT_BYTES) {
    return { ok: false as const, error: "Portrait must be 8 MB or smaller." };
  }
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const webp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  const matches = (file.type === "image/jpeg" && jpg) || (file.type === "image/png" && png) || (file.type === "image/webp" && webp);
  if (!matches) {
    return { ok: false as const, error: "Portrait MIME type does not match file contents." };
  }
  return { ok: true as const };
}

export function logEvent(event: string, data: Record<string, unknown> = {}) {
  const redacted = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (/key|secret|code|portrait|token|webhook/i.test(key)) return [key, "[redacted]"];
      return [key, value];
    }),
  );
  console.info(JSON.stringify({ event, at: new Date().toISOString(), ...redacted }));
}

export function compareSecret(received: string, expected: string) {
  const receivedHash = createHash("sha256").update(received).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const expires = Date.now() + 1000 * 60 * 60;
  const token = createHash("sha256").update(`${process.env.ADMIN_ACCESS_CODE}:${expires}`).digest("hex");
  cookieStore.set("donlien_admin", `${expires}.${token}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("donlien_admin")?.value;
  if (!raw || !process.env.ADMIN_ACCESS_CODE) return false;
  const [expiresText, token] = raw.split(".");
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Date.now() || !token) return false;
  const expected = createHash("sha256").update(`${process.env.ADMIN_ACCESS_CODE}:${expires}`).digest("hex");
  return compareSecret(token, expected);
}
