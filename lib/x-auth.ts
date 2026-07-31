import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "./supabase";

export type XConnection = {
  player_id: string;
  x_user_id: string;
  x_username: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
};

function encryptionKey() {
  const secret = process.env.LIEN_BRIDGE_SECRET;
  if (!secret || secret.length < 32) throw new Error("LIEN bridge is not configured");
  return createHash("sha256").update(`donlien:x:${secret}`).digest();
}

export function encryptXToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptXToken(value: string) {
  const [iv, tag, encrypted] = value.split(".").map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function xRedirectUri() {
  const origin = process.env.LIEN_WEBSITE_URL || process.env.URL || "https://donlien.xyz";
  return new URL("/api/x/callback", origin).toString();
}

export function requireXClient() {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("X publishing is not configured");
  return { clientId, clientSecret };
}

export async function getXConnection(playerId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database is not configured");
  const { data, error } = await supabase
    .from("x_connections")
    .select("player_id,x_user_id,x_username,access_token,refresh_token,expires_at")
    .eq("player_id", playerId)
    .maybeSingle<XConnection>();
  if (error) throw new Error("X connections table is not ready");
  return data;
}

export async function usableXAccessToken(connection: XConnection) {
  const expiresSoon = new Date(connection.expires_at).getTime() < Date.now() + 60_000;
  if (!expiresSoon) return decryptXToken(connection.access_token);
  if (!connection.refresh_token) throw new Error("Reconnect your X account");

  const { clientId, clientSecret } = requireXClient();
  const body = new URLSearchParams({
    refresh_token: decryptXToken(connection.refresh_token),
    grant_type: "refresh_token",
    client_id: clientId,
  });
  const response = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
    cache: "no-store",
  });
  const token = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!response.ok || !token.access_token) throw new Error("X authorization expired");

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database is not configured");
  await supabase
    .from("x_connections")
    .update({
      access_token: encryptXToken(token.access_token),
      refresh_token: token.refresh_token
        ? encryptXToken(token.refresh_token)
        : connection.refresh_token,
      expires_at: new Date(Date.now() + (token.expires_in || 7200) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("player_id", connection.player_id);
  return token.access_token;
}
