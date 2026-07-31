import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function verifyTelegramLogin(params: URLSearchParams) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram login is not configured");
  const hash = params.get("hash") || "";
  const entries = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right));
  const check = entries.map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = createHash("sha256").update(token).digest();
  const expected = createHmac("sha256", secret).update(check).digest("hex");
  if (
    hash.length !== expected.length ||
    !timingSafeEqual(Buffer.from(hash), Buffer.from(expected))
  ) throw new Error("Invalid Telegram login");
  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now() / 1000 - authDate > 86400) throw new Error("Telegram login expired");
  const id = params.get("id") || "";
  if (!/^\d+$/.test(id)) throw new Error("Telegram account is missing");
  return { id };
}
