"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Share2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { shareLienCard } from "@/lib/share-lien-card";
import { HudPanel } from "./HudPanel";
import { LienIdentityCard } from "./LienIdentityCard";
import { makeLienName } from "@/lib/naming";
import { roleProfiles, roles } from "@/lib/content";

type Result = {
  lienId?: string;
  lienName: string;
  imageDataUrl?: string;
  edition?: "standard" | "holographic";
};

type PermanentIdentity = {
  lienId: string;
  lienName: string;
  avatarUrl: string;
  role: string;
  level: number;
  xp: number;
  glb: number;
  lifetimePoints: number;
  seasonId: string;
  seasonName: string;
  seasonPoints: number;
  cardEdition: "standard" | "holographic";
};

export function BecomeLienWizard({
  permanentIdentity,
  freeGeneration,
}: {
  permanentIdentity: PermanentIdentity | null;
  freeGeneration: boolean;
}) {
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState("");
  const [humanName, setHumanName] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("Builder");
  const [edition, setEdition] = useState<"standard" | "holographic">("standard");
  const [portrait, setPortrait] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [status, setStatus] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const lienName = useMemo(() => makeLienName(humanName || "New"), [humanName]);
  const selectedRole = roleProfiles[role];
  const stage = step === 1 ? "human_input" : step === 2 ? "upload" : step === 3 ? "review" : "activation";

  async function trackSignupStage(nextStage = stage, completed = false, nextResult = result) {
    try {
      await fetch("/api/signup-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          stage: nextStage,
          humanName,
          lienName: nextResult?.lienName || lienName,
          role,
          lienId: nextResult?.lienId,
          completed,
        }),
        keepalive: true,
      });
    } catch {
      // Signup tracking should never block the user-facing flow.
    }
  }

  useEffect(() => {
    const stored = window.localStorage.getItem("donlien_generation_session");
    const next =
      stored ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `signup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
    window.localStorage.setItem("donlien_generation_session", next);
    const payment = new URLSearchParams(window.location.search).get("payment");
    const timer = window.setTimeout(() => {
      setSessionId(next);
      if (payment === "success") {
        setStatus("Payment received. Your generation credit will appear as soon as Stripe confirms it.");
      }
      if (payment === "cancelled") {
        setStatus("Checkout cancelled. Your current LIEN identity is unchanged.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    void trackSignupStage(stage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, sessionId]);

  async function transform() {
    if (!permanentIdentity) {
      setStatus("Connect your Telegram LIEN ID first so this avatar receives your permanent ID.");
      return;
    }
    if (!portrait) {
      setStatus("Upload a JPG, PNG, or WEBP portrait first.");
      return;
    }
    setStatus("Pixel LIENification in progress.");
    setPaymentRequired(false);
    void trackSignupStage("transform", false);
    const form = new FormData();
    form.set("sessionId", sessionId);
    form.set("humanName", humanName);
    form.set("role", role);
    form.set("edition", edition);
    form.set("portrait", portrait);
    const response = await fetch("/api/transform", { method: "POST", body: form });
    const payload = await response.json();
    if (!response.ok) {
      if (payload.paymentRequired) {
        setPaymentRequired(true);
        setStatus(payload.error || "Buy a retry credit to generate another image.");
        return;
      }
      setStatus(payload.error || "Transform unavailable.");
      return;
    }
    setResult({
      lienId: permanentIdentity.lienId,
      lienName: payload.lienName,
      imageDataUrl: payload.imageDataUrl,
      edition: payload.edition || edition,
    });
    setStep(3);
    setStatus("Review your DEN / DonLien ID card.");
  }

  async function buyRetryCredit() {
    setCheckoutLoading(true);
    if (!permanentIdentity) {
      setStatus("Connect your Telegram LIEN ID before purchasing a generation.");
      return;
    }
    setStatus(`Opening secure ${edition === "holographic" ? "$7" : "$3"} checkout.`);
    const response = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, edition }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) {
      setCheckoutLoading(false);
      setStatus(payload.error || "Checkout is not available yet.");
      return;
    }
    window.location.assign(payload.url);
  }

  function updatePortrait(file: File | null) {
    setPortrait(file);
    setStatus("");
    if (!file) {
      setPortraitPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPortraitPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  async function downloadCard() {
    if (!cardRef.current) {
      setStatus("Generate your card before downloading it.");
      return;
    }
    setStatus("Preparing your verified LIEN-ID card.");
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#020403",
    });
    const link = document.createElement("a");
    link.download = `${result?.lienName || lienName}-${edition}-lien-id.png`;
    link.href = dataUrl;
    link.click();
    setStatus("Complete LIEN-ID card downloaded.");
  }

  async function shareToX() {
    if (!cardRef.current || !permanentIdentity) {
      setStatus("Generate and activate your LIEN-ID before sharing it.");
      return;
    }
    setStatus("Preparing your verified LIEN-ID for X.");
    try {
      setStatus(
        await shareLienCard({
          card: cardRef.current,
          lienId: permanentIdentity.lienId,
          lienName: result?.lienName || lienName,
          role,
          edition: result?.edition || edition,
          seasonId: permanentIdentity.seasonId || "S01",
        }),
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Sharing canceled.");
        return;
      }
      setStatus(error instanceof Error ? error.message : "Could not open X sharing.");
    }
  }

  async function saveIdentity() {
    if (!result?.imageDataUrl) {
      setStatus("Generate a pixel portrait before saving your identity.");
      return;
    }
    setStatus("Attaching portrait to your permanent LIEN ID.");
    const avatarResponse = await fetch("/api/lien/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: result.imageDataUrl,
        lienName: result.lienName || lienName,
        role,
        edition: result.edition || edition,
      }),
    });
    const avatarPayload = await avatarResponse.json();
    if (!avatarResponse.ok || !avatarPayload.profile) {
      setStatus(
        avatarPayload.error ||
          "Connect your Telegram LIEN ID at /lien-id before saving this portrait.",
      );
      return;
    }
    const response = await fetch("/api/liens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        humanName,
        lienName: result?.lienName || lienName,
        role,
        portraitDataUrl: result?.imageDataUrl,
        genesisStatus: "candidate",
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Could not save identity.");
      return;
    }
    const nextResult = {
      lienId: avatarPayload.profile.lienId,
      lienName: avatarPayload.profile.lienName,
      imageDataUrl: avatarPayload.profile.avatarUrl || result.imageDataUrl,
      edition: avatarPayload.profile.cardEdition || result.edition || edition,
    };
    setResult(nextResult);
    setStep(4);
    void trackSignupStage("activation", true, nextResult);
    setStatus(
      payload.warning ||
        `Permanent LIEN identity activated. Your pixel portrait now follows your account.`,
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-10 md:px-8">
      <div className="text-center">
        <p className="font-display text-lime-300">LEVEL 51 INTAKE</p>
        <h1 className="font-display text-5xl font-black uppercase md:text-7xl">Become a LIEN</h1>
      </div>
      {!permanentIdentity ? (
        <div className="hud-panel clip-hud border border-amber-300/70 p-5 text-center">
          <p className="font-display text-lg uppercase text-amber-200">
            Connect LIEN ID before creating your avatar
          </p>
          <p className="mt-2 text-sm text-zinc-200">
            This guarantees the finished portrait and permanent LIEN ID are issued together.
          </p>
          <a
            className="clip-hud mt-4 inline-block border border-lime-300 px-5 py-3 font-display uppercase text-lime-200"
            href="/lien-id"
          >
            Connect Telegram LIEN ID
          </a>
        </div>
      ) : (
        <div className="hud-panel clip-hud border border-lime-300/50 p-4 text-center">
          <p className="font-display uppercase text-lime-200">
            Permanent ID reserved: {permanentIdentity.lienId}
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {freeGeneration
              ? "Owner/admin account · Standard and Holographic generations are free"
              : "Standard $3 · Holographic $7 · Preview before replacing your current avatar"}
          </p>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-4">
        {["Human Input", "LIENification", "Review", "Activation"].map((label, index) => (
          <div className={`hud-panel clip-hud p-3 text-center font-display uppercase ${step === index + 1 ? "text-lime-300" : "text-zinc-400"}`} key={label}>
            {index + 1}. {label}
          </div>
        ))}
      </div>
      {step === 1 ? (
        <HudPanel title="Human Input" accent="#39FF14">
          <div className="grid gap-4">
            <div className="border border-cyan-300/60 bg-cyan-400/5 p-4">
              <label className="grid cursor-pointer gap-3">
                <span className="font-display text-xl font-black uppercase text-cyan-200">
                  1. Upload your face photo
                </span>
                <span className="text-sm leading-6 text-zinc-200">
                  Required: a clear shoulders-up JPG, PNG, or WEBP. This photo is transformed
                  into your personal pixel LIEN portrait—it is not replaced by the holographic
                  sample card.
                </span>
                <input
                  className="border border-cyan-300/50 bg-black/70 p-4"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => updatePortrait(event.target.files?.[0] || null)}
                />
              </label>
              {portraitPreview ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr]">
                  {/* Local preview data URL; not uploaded until the user saves. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portraitPreview}
                    alt="Uploaded portrait preview"
                    className="aspect-[4/5] w-full border border-cyan-300/50 object-cover"
                  />
                  <p className="self-center font-display uppercase text-lime-200">
                    Portrait attached · ready for LIENification
                  </p>
                </div>
              ) : (
                <p className="mt-3 font-display uppercase text-amber-200">
                  No portrait attached yet
                </p>
              )}
            </div>
            <label className="grid gap-2">
              <span className="font-display uppercase">2. Human name</span>
              <input className="border border-lime-400/30 bg-black/70 p-3" value={humanName} onChange={(event) => setHumanName(event.target.value)} maxLength={80} />
            </label>
            <fieldset className="grid gap-3">
              <legend className="font-display uppercase">3. Choose your LIEN path</legend>
              <p className="text-sm leading-6 text-zinc-300">
                Your role defines the values your identity carries, its visual design, and the
                mission path it can grow into. It does not make one LIEN more valuable than another.
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {roles.map((item) => {
                  const profile = roleProfiles[item];
                  const selected = role === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRole(item)}
                      className={`clip-hud border p-4 text-left transition ${
                        selected
                          ? "border-lime-300 bg-lime-400/10 text-white"
                          : "border-white/20 bg-black/60 text-zinc-300 hover:border-lime-300/60"
                      }`}
                    >
                      <span className="font-display text-lg font-black uppercase text-lime-200">
                        {item}
                      </span>
                      <span className="mt-2 block text-sm leading-5">{profile.purpose}</span>
                      <span className="mt-3 block text-xs uppercase tracking-wider text-cyan-200">
                        {profile.traits.join(" · ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="grid gap-3">
              <legend className="font-display uppercase">4. Choose your seasonal card edition</legend>
              <p className="text-sm leading-6 text-zinc-300">
                Both editions carry the same permanent LIEN-ID, role, GLB balance, season
                points, lifetime points, and gameplay progression. Holographic adds a premium
                collectible treatment and Genesis LIENFT whitelist eligibility.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={edition === "standard"}
                  onClick={() => setEdition("standard")}
                  className={`clip-hud border p-5 text-left ${
                    edition === "standard"
                      ? "border-lime-300 bg-lime-400/10"
                      : "border-white/20 bg-black/60"
                  }`}
                >
                  <span className="font-display text-xl font-black uppercase text-lime-200">
                    Standard Edition
                  </span>
                  <span className="mt-2 block text-sm text-zinc-300">
                    Personalized pixel portrait, matte Signal frame, live stats, verified QR,
                    seasonal archive, and downloadable sharing card. $3.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={edition === "holographic"}
                  onClick={() => setEdition("holographic")}
                  className={`clip-hud border p-5 text-left ${
                    edition === "holographic"
                      ? "border-fuchsia-300 bg-fuchsia-400/10"
                      : "border-white/20 bg-black/60"
                  }`}
                >
                  <span className="font-display text-xl font-black uppercase text-fuchsia-200">
                    Holographic Edition
                  </span>
                  <span className="mt-2 block text-sm text-zinc-300">
                    Everything in Standard, plus metallic framing, animated prismatic foil,
                    motion-responsive light, a glowing role treatment, and Genesis LIENFT
                    whitelist eligibility. $7.
                  </span>
                </button>
              </div>
            </fieldset>
            <p className="border border-cyan-300/30 bg-cyan-300/5 p-3 text-xs leading-5 text-cyan-100">
              Both editions provide the same ecosystem progression. Holographic does not grant
              gameplay advantages. Genesis LIENFT whitelist eligibility is verified from the
              completed Holographic order and does not guarantee a mint, allocation, or purchase.
            </p>
            <div className="border-l-2 border-lime-300 bg-black/55 p-4">
              <p className="font-display text-xl font-black uppercase text-lime-200">
                {selectedRole.title}
              </p>
              <p className="mt-2 leading-6 text-zinc-200">{selectedRole.purpose}</p>
              <p className="mt-3 text-sm leading-6 text-amber-100">
                <span className="font-display uppercase">Your charge:</span>{" "}
                {selectedRole.charge}
              </p>
              <p className="mt-3 text-xs uppercase tracking-wider text-zinc-400">
                Insignia: {selectedRole.insignia} · Palette: {selectedRole.palette}
              </p>
            </div>
          </div>
          <button className="clip-hud mt-5 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200 disabled:opacity-40" onClick={() => setStep(2)} disabled={!humanName.trim() || !portrait || !permanentIdentity || !sessionId}>
            Continue with {edition === "holographic" ? "Holographic" : "Standard"} Card
          </button>
        </HudPanel>
      ) : null}
      {step === 2 ? (
        <HudPanel title="LIENification" accent="#39FF14">
          <div className="mb-4 border border-lime-300/40 bg-lime-400/5 p-4">
            <p className={`font-display uppercase ${edition === "holographic" ? "text-fuchsia-200" : "text-lime-200"}`}>
              {edition === "holographic" ? "Holographic" : "Standard"} edition selected
            </p>
            <p className="mt-2 text-sm text-zinc-300">
              This edition will be applied only to this generated seasonal card. You can go
              back and select the other edition before generating.
            </p>
          </div>
          <label className="grid gap-2">
            <span className="font-display uppercase">Portrait attached · replace if needed</span>
            <input className="border border-lime-400/30 bg-black/70 p-3" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => updatePortrait(event.target.files?.[0] || null)} />
          </label>
          {portraitPreview ? (
            <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr]">
              <div className="alien-core aspect-[4/5] overflow-hidden border border-lime-300/40">
                {/* Local preview data URL; not uploaded or optimized. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={portraitPreview} alt="Portrait preview" className="h-full w-full object-cover" />
              </div>
              <div className="self-center text-sm leading-6 text-zinc-200">
                <p className="font-display uppercase text-lime-300">Headshot directions</p>
                <ul className="mt-2 grid gap-1">
                  <li>Use a clear face photo from shoulders up.</li>
                  <li>Keep eyes, jawline, hairline, and expression visible.</li>
                  <li>Avoid heavy filters, sunglasses, masks, and dark shadows.</li>
                  <li>AI creates only your portrait. Official names, levels, IDs, and edition effects are rendered by the LIEN card system.</li>
                </ul>
              </div>
            </div>
          ) : null}
          <button className="clip-hud mt-5 inline-flex items-center gap-2 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" onClick={transform}>
            <Sparkles size={18} /> Transform
          </button>
          {paymentRequired ? (
            <button className="clip-hud ml-0 mt-3 inline-flex items-center gap-2 border border-amber-300 px-5 py-3 font-display uppercase text-amber-100 sm:ml-3" onClick={buyRetryCredit} disabled={checkoutLoading}>
              Unlock {edition === "holographic" ? "Holographic · $7" : "Standard · $3"}
            </button>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            Your uploaded photo is only the source image. Press Transform to create the actual
            pixel LIEN portrait; the original photo cannot be saved as a finished LIEN-ID.
          </p>
        </HudPanel>
      ) : null}
      {step === 3 ? (
        <HudPanel title="Review" accent="#39FF14">
          <div className="grid gap-5 md:grid-cols-[320px_1fr]">
            {result?.imageDataUrl ? (
              <LienIdentityCard
                ref={cardRef}
                portraitUrl={result.imageDataUrl}
                lienId={permanentIdentity?.lienId || "LIEN-PENDING"}
                lienName={result.lienName || lienName}
                role={role}
                edition={result.edition || edition}
                level={permanentIdentity?.level || 1}
                xp={permanentIdentity?.xp || 0}
                glb={permanentIdentity?.glb || 0}
                lifetimePoints={permanentIdentity?.lifetimePoints || 0}
                seasonId={permanentIdentity?.seasonId || "S01"}
                seasonName={permanentIdentity?.seasonName || "First Signal"}
                seasonPoints={permanentIdentity?.seasonPoints || 0}
              />
            ) : (
              <div className="alien-core grid aspect-[4/5] place-items-center border border-lime-300/40">
                <span className="font-display text-5xl">DL</span>
              </div>
            )}
            <div className="grid content-center gap-2">
              <p>Human designation: {humanName}</p>
              <p>LIEN designation: {result?.lienName || lienName}</p>
              <p>Role: {role}</p>
              <p>Edition: {result?.edition === "holographic" ? "Holographic" : "Standard"}</p>
              <p className="text-sm text-amber-100">{selectedRole.charge}</p>
              <p>Level 1</p>
              <p>Genesis Candidate</p>
              <p>Permanent ID: {permanentIdentity?.lienId || "Connect LIEN ID"}</p>
              <button className="clip-hud mt-4 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" onClick={saveIdentity}>
                Save Identity
              </button>
              <button className="clip-hud mt-2 border border-amber-300 px-5 py-3 font-display uppercase text-amber-100" onClick={transform}>
                Generate Another
              </button>
              {paymentRequired ? (
                <button className="clip-hud mt-2 border border-amber-300 px-5 py-3 font-display uppercase text-amber-100" onClick={buyRetryCredit} disabled={checkoutLoading}>
                  Generate Another · {edition === "holographic" ? "$7" : "$3"}
                </button>
              ) : null}
            </div>
          </div>
        </HudPanel>
      ) : null}
      {step === 4 ? (
        <HudPanel title="Activation" accent="#39FF14">
          <div className="grid gap-5 md:grid-cols-[320px_1fr]">
            {result?.imageDataUrl && permanentIdentity ? (
              <LienIdentityCard
                ref={cardRef}
                portraitUrl={result.imageDataUrl}
                lienId={permanentIdentity.lienId}
                lienName={result.lienName || lienName}
                role={role}
                edition={result.edition || edition}
                level={permanentIdentity.level || 1}
                xp={permanentIdentity.xp || 0}
                glb={permanentIdentity.glb || 0}
                lifetimePoints={permanentIdentity.lifetimePoints || 0}
                seasonId={permanentIdentity.seasonId || "S01"}
                seasonName={permanentIdentity.seasonName || "First Signal"}
                seasonPoints={permanentIdentity.seasonPoints || 0}
              />
            ) : null}
            <div className="grid content-center gap-3">
              <p className="font-display text-xl font-black uppercase text-lime-200">
                LIEN-ID activated
              </p>
              <p className="text-sm leading-6 text-zinc-300">
                Your completed card is ready to download or share. On supported phones, the
                card image and prepared message open together in the share sheet.
              </p>
              <button className="clip-hud inline-flex items-center justify-center gap-2 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" onClick={downloadCard}>
                <Download size={18} /> Download ID
              </button>
              <button className="clip-hud inline-flex items-center justify-center gap-2 border border-fuchsia-300 px-5 py-3 font-display uppercase text-fuchsia-200" onClick={shareToX}>
                <Share2 size={18} /> Share to X
              </button>
              <a className="clip-hud inline-flex items-center justify-center border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" href="/lienity">
                Join LIENITY
              </a>
            </div>
          </div>
        </HudPanel>
      ) : null}
      {status ? <p className="hud-panel clip-hud p-4 text-sm text-lime-100" aria-live="polite">{status}</p> : null}
    </section>
  );
}
