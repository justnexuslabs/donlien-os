import type { LienProfile } from "./lien-session";
import { getSupabaseAdmin } from "./supabase";

/**
 * The website database is authoritative for administrator-appointed roles.
 * This prevents a stale game profile from hiding an appointment or restoring a
 * revoked Guardian designation during the next Telegram profile refresh.
 */
export async function applyAuthoritativeRole(profile: LienProfile) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return profile;

  const { data, error } = await supabase
    .from("liens")
    .select("role,role_locked")
    .eq("lien_id", profile.lienId)
    .maybeSingle();

  if (error || !data?.role) return profile;
  if (data.role === "DEN Guardian" && data.role_locked !== true) return profile;
  return { ...profile, role: data.role };
}
