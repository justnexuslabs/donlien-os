import { createHmac, timingSafeEqual } from "node:crypto";

export type LienProfile = {
  lienId: string;
  lienName: string;
  avatarUrl: string;
  role: string;
  class: string;
  level: number;
  xp: number;
  glb: number;
  lifetimeEarned: number;
  lifetimePoints: number;
  seasonId: string;
  seasonName: string;
  seasonPoints: number;
  cardEdition: "standard" | "holographic";
  cardStatus: "active" | "retired";
  cardIssuedAt: string;
  cardHistory: Array<{
    seasonId: string;
    seasonName: string;
    edition: "standard" | "holographic";
    issuedAt: string;
    retiredAt: string;
    avatarUrl: string;
    seasonPoints: number;
  }>;
  referrals: number;
  inventory: string[];
  equipped: Record<string, string>;
  achievements: string[];
  streak?: number;
  gameStats?: Record<string, {
    rating: number;
    played: number;
    clears: number;
    bestScore: number;
    extractions: number;
    perfectLocks: number;
    updatedAt: string;
  }>;
};

export type LienSession = {
  profile: LienProfile;
  userId?: string;
  legacyPlayerId: string;
  /** Compatibility alias for sessions issued before permanent UUID migration. */
  playerId?: string;
  exp: number;
};

function secret() {
  const value = process.env.LIEN_BRIDGE_SECRET;
  if (!value || value.length < 32) throw new Error("LIEN bridge is not configured");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createLienSession(
  profile: LienProfile,
  identity: string | { userId: string; legacyPlayerId: string },
) {
  const permanent =
    typeof identity === "string" ? { legacyPlayerId: identity } : identity;
  const payload = Buffer.from(
    JSON.stringify({
      profile,
      ...permanent,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    } satisfies LienSession),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readLienSessionDetails(value?: string): LienSession | null {
  try {
    if (!value) return null;
    const [payload, received] = value.split(".");
    const expected = sign(payload);
    if (
      !received ||
      received.length !== expected.length ||
      !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
    ) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as LienSession;
    const legacyPlayerId = session.legacyPlayerId || session.playerId || "";
    if (session.exp <= Date.now() || !/^\d+$/.test(legacyPlayerId)) return null;
    if (
      session.userId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        session.userId,
      )
    ) {
      return null;
    }
    return { ...session, legacyPlayerId };
  } catch {
    return null;
  }
}

export function readLienSession(value?: string): LienProfile | null {
  return readLienSessionDetails(value)?.profile || null;
}
