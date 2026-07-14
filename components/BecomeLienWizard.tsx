"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share2, Sparkles } from "lucide-react";
import { HudPanel } from "./HudPanel";
import { makeLienName } from "@/lib/naming";
import { roles } from "@/lib/content";

type Result = {
  lienId: string;
  lienName: string;
  imageDataUrl?: string;
};

export function BecomeLienWizard() {
  const [step, setStep] = useState(1);
  const [sessionId] = useState(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `signup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  });
  const [humanName, setHumanName] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("Builder");
  const [portrait, setPortrait] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const lienName = useMemo(() => makeLienName(humanName || "New"), [humanName]);
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
    void trackSignupStage(stage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  async function transform() {
    if (!portrait) {
      setStatus("Upload a JPG, PNG, or WEBP portrait first.");
      return;
    }
    setStatus("Pixel LIENification in progress.");
    void trackSignupStage("transform", false);
    const form = new FormData();
    form.set("humanName", humanName);
    form.set("role", role);
    form.set("portrait", portrait);
    const response = await fetch("/api/transform", { method: "POST", body: form });
    const payload = await response.json();
    if (!response.ok) {
      if (payload.lienId && payload.lienName && portraitPreview) {
        setResult({ lienId: payload.lienId, lienName: payload.lienName, imageDataUrl: portraitPreview });
        setStep(3);
        setStatus(`${payload.error || "Live AI transform is not configured yet."} Demo review is using your uploaded portrait preview.`);
        return;
      }
      setStatus(payload.error || "Transform unavailable.");
      return;
    }
    setResult({ lienId: payload.lienId, lienName: payload.lienName, imageDataUrl: payload.imageDataUrl });
    setStep(3);
    setStatus("Review your pixel LIEN identity.");
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

  async function saveIdentity() {
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
    const nextResult = { lienId: payload.lienId, lienName: payload.lienName, imageDataUrl: result?.imageDataUrl };
    setResult(nextResult);
    setStep(4);
    void trackSignupStage("activation", true, nextResult);
    setStatus(payload.warning || `Identity activation ready. Webhook: ${payload.webhookStatus || "not configured"}.`);
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-10 md:px-8">
      <div className="text-center">
        <p className="font-display text-lime-300">LEVEL 51 INTAKE</p>
        <h1 className="font-display text-5xl font-black uppercase md:text-7xl">Become a LIEN</h1>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {["Human Input", "LIENification", "Review", "Activation"].map((label, index) => (
          <div className={`hud-panel clip-hud p-3 text-center font-display uppercase ${step === index + 1 ? "text-lime-300" : "text-zinc-400"}`} key={label}>
            {index + 1}. {label}
          </div>
        ))}
      </div>
      {step === 1 ? (
        <HudPanel title="Human Input" accent="#39FF14">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-display uppercase">Human name</span>
              <input className="border border-lime-400/30 bg-black/70 p-3" value={humanName} onChange={(event) => setHumanName(event.target.value)} maxLength={80} />
            </label>
            <label className="grid gap-2">
              <span className="font-display uppercase">Role</span>
              <select className="border border-lime-400/30 bg-black/70 p-3" value={role} onChange={(event) => setRole(event.target.value as (typeof roles)[number])}>
                {roles.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <button className="clip-hud mt-5 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" onClick={() => setStep(2)} disabled={!humanName.trim()}>
            Continue
          </button>
        </HudPanel>
      ) : null}
      {step === 2 ? (
        <HudPanel title="LIENification" accent="#39FF14">
          <label className="grid gap-2">
            <span className="font-display uppercase">Portrait upload</span>
            <input className="border border-lime-400/30 bg-black/70 p-3" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => updatePortrait(event.target.files?.[0] || null)} />
          </label>
          {portraitPreview ? (
            <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr]">
              <div className="alien-core aspect-[4/5] overflow-hidden border border-lime-300/40">
                {/* Local preview data URL; not uploaded or optimized. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={portraitPreview} alt="Portrait preview" className="h-full w-full object-cover" />
              </div>
              <p className="self-center text-sm leading-6 text-zinc-200">
                Live LIENification turns this portrait into a premium pixel DonLien avatar once `OPENAI_API_KEY` is configured.
              </p>
            </div>
          ) : null}
          <button className="clip-hud mt-5 inline-flex items-center gap-2 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" onClick={transform}>
            <Sparkles size={18} /> Transform
          </button>
          {portraitPreview ? (
            <button
              className="clip-hud ml-0 mt-3 inline-flex items-center gap-2 border border-white/30 px-5 py-3 font-display uppercase text-white sm:ml-3"
              onClick={() => {
                setResult({ lienId: `LIEN-${Date.now().toString(36).toUpperCase()}`, lienName, imageDataUrl: portraitPreview });
                setStep(3);
                setStatus("Demo review created from your uploaded portrait preview. Live pixel transform requires OpenAI credentials.");
              }}
            >
              Use Demo Preview
            </button>
          ) : null}
        </HudPanel>
      ) : null}
      {step === 3 ? (
        <HudPanel title="Review" accent="#39FF14">
          <div className="grid gap-5 md:grid-cols-[280px_1fr]">
            <div className="alien-core grid aspect-[4/5] place-items-center overflow-hidden border border-lime-300/40">
              {result?.imageDataUrl ? (
                // Data URLs returned by the protected transform route cannot be optimized by next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.imageDataUrl} alt="Generated pixel LIEN avatar" className="h-full w-full object-cover [image-rendering:pixelated]" />
              ) : (
                <span className="font-display text-5xl">DL</span>
              )}
            </div>
            <div className="grid content-center gap-2">
              <p>Human designation: {humanName}</p>
              <p>LIEN designation: {result?.lienName || lienName}</p>
              <p>Role: {role}</p>
              <p>Level 51</p>
              <p>Genesis Candidate</p>
              <p>Unique ID: {result?.lienId || "Pending"}</p>
              <button className="clip-hud mt-4 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" onClick={saveIdentity}>
                Save Identity
              </button>
            </div>
          </div>
        </HudPanel>
      ) : null}
      {step === 4 ? (
        <HudPanel title="Activation" accent="#39FF14">
          <div className="grid gap-3 sm:grid-cols-3">
            <a className="clip-hud inline-flex items-center justify-center gap-2 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" href={result?.imageDataUrl || "#"} download="donlien-id.png">
              <Download size={18} /> Download ID
            </a>
            <a className="clip-hud inline-flex items-center justify-center gap-2 border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I joined the LIENIVERSE as ${result?.lienName || lienName}.`)}`} target="_blank" rel="noreferrer">
              <Share2 size={18} /> Share to X
            </a>
            <a className="clip-hud inline-flex items-center justify-center border border-lime-300 px-5 py-3 font-display uppercase text-lime-200" href="/lienity">
              Join LIENITY
            </a>
          </div>
        </HudPanel>
      ) : null}
      {status ? <p className="hud-panel clip-hud p-4 text-sm text-lime-100" aria-live="polite">{status}</p> : null}
    </section>
  );
}
