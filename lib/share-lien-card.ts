import { toPng } from "html-to-image";

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

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Portrait could not be embedded."));
    reader.readAsDataURL(blob);
  });
}

async function prepareCardImages(card: HTMLElement) {
  const images = Array.from(card.querySelectorAll("img"));
  const originals = images.map((image) => image.getAttribute("src") || "");

  await Promise.all(images.map(async (image) => {
    const source = image.currentSrc || image.src;
    if (!source) return;
    if (!source.startsWith("data:")) {
      const response = await fetch(source, { cache: "no-store", credentials: "omit" });
      if (!response.ok) throw new Error("The saved LIEN portrait could not be loaded for sharing.");
      image.src = await blobToDataUrl(await response.blob());
    }
    if (typeof image.decode === "function") await image.decode();
  }));

  return () => images.forEach((image, index) => image.setAttribute("src", originals[index]));
}

export async function renderLienCardPng(card: HTMLElement, pixelRatio = 3) {
  const restoreImages = await prepareCardImages(card);
  try {
    return await toPng(card, {
      cacheBust: false,
      pixelRatio,
      backgroundColor: "#020403",
    });
  } finally {
    restoreImages();
  }
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

  // toPng is already proven by the card download flow and is more reliable
  // than canvas.toBlob inside Telegram's iOS webview.
  const dataUrl = await renderLienCardPng(input.card, xStatus.connected ? 2 : 3);
  const encoded = dataUrl.split(",")[1];
  if (!encoded) throw new Error("The LIEN-ID card image could not be prepared.");
  const bytes = Uint8Array.from(window.atob(encoded), (character) => character.charCodeAt(0));
  const blob = new Blob([bytes], { type: "image/png" });

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
  try {
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
  } catch (error) {
    // A user cancel must remain a cancel. Telegram/Safari compatibility errors
    // continue into the download + X intent fallback below.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
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
