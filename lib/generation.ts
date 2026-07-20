import { getSupabaseAdmin } from "./supabase";
import { logEvent } from "./security";

type GenerationSession = {
  session_id: string;
  free_generations_used: number;
  paid_credits: number;
  paid_generations_used: number;
};

export async function getGenerationAccess(sessionId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: true as const, kind: "local" as const };

  const { data, error } = await supabase
    .from("generation_sessions")
    .select("session_id, free_generations_used, paid_credits, paid_generations_used")
    .eq("session_id", sessionId)
    .maybeSingle<GenerationSession>();

  if (error) {
    logEvent("generation_access_failed", { reason: error.code });
    return { ok: false as const, error: "Generation access could not be verified." };
  }

  if (!data) {
    const { error: insertError } = await supabase.from("generation_sessions").insert({ session_id: sessionId });
    if (insertError) {
      logEvent("generation_session_create_failed", { reason: insertError.code });
      return { ok: false as const, error: "Generation access could not be created." };
    }
    return { ok: true as const, kind: "free" as const };
  }

  if (data.free_generations_used < 1) return { ok: true as const, kind: "free" as const };
  if (data.paid_credits > 0) return { ok: true as const, kind: "paid" as const };
  return {
    ok: false as const,
    paymentRequired: true,
    error: "Your free LIENification is used. Buy a retry credit to generate another image.",
  };
}

export async function recordSuccessfulGeneration(sessionId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { data, error } = await supabase
    .from("generation_sessions")
    .select("free_generations_used, paid_credits, paid_generations_used")
    .eq("session_id", sessionId)
    .maybeSingle<Pick<GenerationSession, "free_generations_used" | "paid_credits" | "paid_generations_used">>();

  if (error || !data) {
    logEvent("generation_record_lookup_failed", { reason: error?.code || "missing_session" });
    return;
  }

  const update =
    data.free_generations_used < 1
      ? { free_generations_used: data.free_generations_used + 1 }
      : {
          paid_credits: Math.max(data.paid_credits - 1, 0),
          paid_generations_used: data.paid_generations_used + 1,
        };

  const { error: updateError } = await supabase
    .from("generation_sessions")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("session_id", sessionId);

  if (updateError) logEvent("generation_record_update_failed", { reason: updateError.code });
}

export async function addGenerationCredits(sessionId: string, credits: number) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase is not configured." };

  const { error } = await supabase.rpc("add_generation_credits", {
    target_session_id: sessionId,
    credit_count: credits,
  });

  if (error) {
    logEvent("generation_credit_add_failed", { reason: error.code });
    return { ok: false as const, error: "Unable to add generation credits." };
  }

  return { ok: true as const };
}
