import { getSupabaseAdmin } from "./supabase";
import { logEvent } from "./security";

type GenerationSession = {
  session_id: string;
  free_generations_used: number;
  paid_credits: number;
  paid_generations_used: number;
  standard_credits: number;
  holographic_credits: number;
};

export async function getGenerationAccess(
  sessionId: string,
  edition: "standard" | "holographic",
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false as const, error: "Paid generation is not configured.", paymentRequired: false };
  }

  const { data, error } = await supabase
    .from("generation_sessions")
    .select(
      "session_id, free_generations_used, paid_credits, paid_generations_used, standard_credits, holographic_credits",
    )
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
    return {
      ok: false as const,
      paymentRequired: true,
      error:
        edition === "holographic"
          ? "Unlock one Holographic Pixel LIEN-ID generation for $7."
          : "Unlock one Standard Pixel LIEN-ID generation for $3.",
    };
  }

  const available =
    edition === "holographic" ? data.holographic_credits : data.standard_credits;
  if (available > 0) return { ok: true as const, kind: "paid" as const };
  return {
    ok: false as const,
    paymentRequired: true,
    error:
      edition === "holographic"
        ? "Unlock one Holographic Pixel LIEN-ID generation for $7."
        : "Unlock one Standard Pixel LIEN-ID generation for $3.",
  };
}

export async function recordSuccessfulGeneration(
  sessionId: string,
  edition: "standard" | "holographic",
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { data, error } = await supabase
    .from("generation_sessions")
    .select(
      "free_generations_used, paid_credits, paid_generations_used, standard_credits, holographic_credits",
    )
    .eq("session_id", sessionId)
    .maybeSingle<
      Pick<
        GenerationSession,
        | "free_generations_used"
        | "paid_credits"
        | "paid_generations_used"
        | "standard_credits"
        | "holographic_credits"
      >
    >();

  if (error || !data) {
    logEvent("generation_record_lookup_failed", { reason: error?.code || "missing_session" });
    return;
  }

  const update = {
    standard_credits:
      edition === "standard"
        ? Math.max(data.standard_credits - 1, 0)
        : data.standard_credits,
    holographic_credits:
      edition === "holographic"
        ? Math.max(data.holographic_credits - 1, 0)
        : data.holographic_credits,
    paid_generations_used: data.paid_generations_used + 1,
  };

  const { error: updateError } = await supabase
    .from("generation_sessions")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("session_id", sessionId);

  if (updateError) logEvent("generation_record_update_failed", { reason: updateError.code });
}

export async function addGenerationCredits(
  sessionId: string,
  edition: "standard" | "holographic",
  credits: number,
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const, error: "Supabase is not configured." };

  const { error } = await supabase.rpc("add_generation_credits", {
    target_session_id: sessionId,
    target_edition: edition,
    credit_count: credits,
  });

  if (error) {
    logEvent("generation_credit_add_failed", { reason: error.code });
    return { ok: false as const, error: "Unable to add generation credits." };
  }

  return { ok: true as const };
}
