import { toBlob } from "html-to-image";

type ShareLienCardInput = {
  card: HTMLElement;
  lienId: string;
  lienName: string;
  role: string;
  edition: string;
  seasonId: string;
};

function shareCopy({ lienId, lienName, role, edition }: ShareLienCardInput) {
  const editionLabel = edition === "holographic" ? "Holographic" : "Standard";
  const verificationUrl = `https://donlien.xyz/verify/${encodeURIComponent(lienId)}`;
  const text = [
    `My LIENdentity is live.`,
    `${lienName} · ${role} · ${editionLabel} Edition`,
    `Verify my permanent LIEN-ID: ${verificationUrl}`,
    `#LIENID #LIENIVERSE #DonLien`,
  ].join("\n\n");

  return { text, verificationUrl };
}

export async function shareLienCard(input: ShareLienCardInput) {
  const { text, verificationUrl } = shareCopy(input);
  let xStatus: {
    configured?: boolean;
    connected?: boolean;
    username?: string | null;
  } = { configured: false, connected: false };

  // Native sharing must remain available even when the optional X status
  // endpoint is unavailable or the user's LIEN session needs refreshing.
  try {
    const statusResponse = await fetch("/api/x/status", { cache: "no-store" });
    if (statusResponse.ok) xStatus = await statusResponse.json();
  } catch {
    // Continue with the operating-system share sheet.
  }

  if (xStatus.configured && !xStatus.connected) {
    window.location.assign("/api/x/connect");
    return "Opening X authorization.";
  }

  if (
    xStatus.configured &&
    xStatus.connected &&
    !window.confirm(
      `Publish this LIEN-ID card and message to @${xStatus.username || "your X account"}?`,
    )
  ) {
    return "X post canceled.";
  }

  const blob = await toBlob(input.card, {
    cacheBust: true,
    pixelRatio: xStatus.connected ? 2 : 3,
    backgroundColor: "#020403",
  });

  if (!blob) throw new Error("The LIEN-ID card image could not be prepared.");

  if (xStatus.configured && xStatus.connected) {
    const form = new FormData();
    form.set("text", text);
    form.set("image", new File([blob], "lien-id.png", { type: "image/png" }));
    const response = await fetch("/api/x/publish", { method: "POST", body: form });
    const payload = (await response.json()) as { postUrl?: string; error?: string };
    if (!response.ok || !payload.postUrl) {
      throw new Error(payload.error || "X could not publish the LIEN-ID card.");
    }
    window.open(payload.postUrl, "_blank", "noopener,noreferrer");
    return `Published to @${xStatus.username}.`;
  }

  const fileName = `${input.lienName}-${input.edition}-${input.seasonId}.png`;
  const file = new File([blob], fileName, { type: "image/png" });
  const nativeShare = {
    title: `${input.lienName} · LIEN-ID`,
    text,
    files: [file],
  };

  if (
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare(nativeShare)
  ) {
    await navigator.share(nativeShare);
    return "Share sheet opened with your verified card attached. Choose X to post it.";
  }

  const downloadUrl = URL.createObjectURL(blob);
  const download = document.createElement("a");
  download.href = downloadUrl;
  download.download = fileName;
  download.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 10_000);

  const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  // A delayed window.open is commonly blocked by Safari and Telegram's
  // in-app browser after the asynchronous card render. A same-window
  // navigation is reliable and the Back button returns to the LIEN card.
  window.location.assign(intent);
  return "Card downloaded and X opened. Attach the downloaded PNG to your post.";
}
