import { getSupabaseAdmin } from "./supabase";
import { logEvent } from "./security";

export type PermanentIdentity = {
  userId: string;
  legacyPlayerId: string;
};

export async function resolveTelegramIdentity(
  telegramUserId: string,
  lienId: string,
  lienName: string,
): Promise<PermanentIdentity> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Permanent LIEN identity is not configured");

  const { data, error } = await supabase.rpc("resolve_telegram_identity", {
    target_telegram_user_id: telegramUserId,
    target_lien_id: lienId,
    target_lien_name: lienName,
  });

  if (error || typeof data !== "string") {
    logEvent("permanent_identity_resolution_failed", {
      lienId,
      reason: error?.code || "invalid_response",
    });
    throw new Error("Permanent LIEN identity could not be resolved");
  }

  return { userId: data, legacyPlayerId: telegramUserId };
}
