import { logEvent } from "./security";

type WebhookPayload = {
  event: "lien_saved" | "signup_stage";
  lienId?: string;
  lienName?: string;
  role?: string;
  genesisStatus?: string;
  signupStage?: string;
  completed?: boolean;
};

export async function notifyLienWebhook(payload: WebhookPayload) {
  const url = process.env.NEW_LIEN_WEBHOOK_URL;
  if (!url) return "not_configured";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        sentAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      logEvent("webhook_non_2xx", { eventName: payload.event, status: response.status });
      return "failed";
    }
    return "sent";
  } catch {
    logEvent("webhook_failed", { eventName: payload.event });
    return "failed";
  }
}
