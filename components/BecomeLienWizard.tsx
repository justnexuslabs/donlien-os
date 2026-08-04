"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Download, LockKeyhole, Share2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { shareLienCard } from "@/lib/share-lien-card";
import { makeLienName } from "@/lib/naming";
import { roleProfiles, seasonOneRoles } from "@/lib/content";
import { EditionComparison } from "./EditionComparison";
import { HudPanel } from "./HudPanel";
import { LienIdentityCard } from "./LienIdentityCard";

type Result = { lienId?: string; lienName: string; imageDataUrl?: string; edition?: "standard" | "holographic" };
type PermanentIdentity = { lienId: string; lienName: string; avatarUrl: string; role: string; level: number; xp: number; glb: number; lifetimePoints: number; seasonId: string; seasonName: string; seasonPoints: number; cardEdition: "standard" | "holographic" };
type OrderStatus = "pending_payment" | "paid" | "queued" | "generating" | "needs_review" | "completed" | "failed" | "refunded" | null;

const steps = ["Connect Telegram", "Upload Photo", "Choose Name", "Choose Role", "Choose Edition", "Review & Pay", "Generate & Activate"];
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

function openDraftDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("donlien-private-drafts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("portraits");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function savePortraitDraft(file: File) { const db = await openDraftDb(); const tx = db.transaction("portraits", "readwrite"); tx.objectStore("portraits").put(file, "current"); }
async function loadPortraitDraft() { const db = await openDraftDb(); return new Promise<File | null>((resolve) => { const request = db.transaction("portraits").objectStore("portraits").get("current"); request.onsuccess = () => resolve(request.result instanceof File ? request.result : request.result instanceof Blob ? new File([request.result], "portrait.jpg", { type: request.result.type }) : null); request.onerror = () => resolve(null); }); }
async function clearPortraitDraft() { const db = await openDraftDb(); db.transaction("portraits", "readwrite").objectStore("portraits").delete("current"); }

export function BecomeLienWizard({ permanentIdentity, freeGeneration }: { permanentIdentity: PermanentIdentity | null; freeGeneration: boolean }) {
  const [step, setStep] = useState(permanentIdentity ? 2 : 1);
  const [sessionId, setSessionId] = useState("");
  const [humanName, setHumanName] = useState("");
  const [designation, setDesignation] = useState("");
  const [designationState, setDesignationState] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [role, setRole] = useState<(typeof seasonOneRoles)[number]>("Builder");
  const [edition, setEdition] = useState<"standard" | "holographic">("standard");
  const [portrait, setPortrait] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [aiConsent, setAiConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const lienName = useMemo(() => designation.trim() || makeLienName(humanName || "New"), [designation, humanName]);
  const selectedRole = roleProfiles[role];
  const generationReady = freeGeneration || ["paid", "queued", "generating"].includes(orderStatus || "");

  useEffect(() => {
    const stored = window.localStorage.getItem("donlien_generation_session");
    const next = stored || crypto.randomUUID();
    window.localStorage.setItem("donlien_generation_session", next);
    const payment = new URLSearchParams(window.location.search).get("payment");
    const timer = window.setTimeout(() => {
      setSessionId(next);
      if (payment === "success") { setStep(6); setStatus("Payment returned successfully. Waiting for secure Stripe confirmation."); }
      if (payment === "cancelled") { setStep(6); setStatus("Checkout cancelled. No card was generated."); }
      void loadPortraitDraft().then((file) => { if (file) updatePortrait(file, false); });
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId || freeGeneration || step !== 6) return;
    let active = true;
    const check = async () => {
      const response = await fetch(`/api/payments/status?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
      const payload = await response.json();
      if (active && response.ok) setOrderStatus(payload.order?.status || null);
    };
    void check(); const timer = window.setInterval(() => void check(), 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, [freeGeneration, sessionId, step]);

  async function track(event: string) { try { await fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, sessionId }), keepalive: true }); } catch {} }

  function updatePortrait(file: File | null, persist = true) {
    if (!file) { setPortrait(null); setPortraitPreview(""); return; }
    if (!allowedTypes.includes(file.type) || file.size > 8 * 1024 * 1024) { setStatus("Use one JPG, PNG, or WEBP image no larger than 8 MB."); return; }
    setPortrait(file); setStatus("");
    const reader = new FileReader(); reader.onload = () => setPortraitPreview(typeof reader.result === "string" ? reader.result : ""); reader.readAsDataURL(file);
    if (persist) void savePortraitDraft(file);
    void track("photo_upload_completed");
  }

  async function checkDesignation() {
    setDesignationState("checking");
    const response = await fetch(`/api/liens/availability?designation=${encodeURIComponent(designation)}`, { cache: "no-store" });
    const payload = await response.json();
    setDesignationState(response.ok && payload.available ? "available" : "unavailable");
    setStatus(response.ok && payload.available ? "LIEN designation is available." : payload.error || "That LIEN designation is already in use.");
  }

  async function startCheckout() {
    setCheckoutLoading(true); setStatus(`Opening secure ${edition === "holographic" ? "$7" : "$3"} card or crypto checkout.`); void track("checkout_started");
    const response = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, edition }) });
    const payload = await response.json();
    if (!response.ok || !payload.url) { setCheckoutLoading(false); setStatus(payload.error || "Checkout is unavailable."); return; }
    window.location.assign(payload.url);
  }

  async function transform() {
    if (!permanentIdentity || !portrait || !aiConsent || !termsAccepted) { setStatus("Complete Telegram connection, photo, consent, and terms first."); return; }
    setGenerating(true); setStatus("LIENification in progress. Keep this page open."); void track("generation_started");
    const form = new FormData(); form.set("sessionId", sessionId); form.set("humanName", humanName); form.set("lienName", lienName); form.set("role", role); form.set("edition", edition); form.set("portrait", portrait);
    const response = await fetch("/api/transform", { method: "POST", body: form }); const payload = await response.json(); setGenerating(false);
    if (!response.ok) { setStatus(payload.error || "Generation failed. Your paid order remains recoverable."); void track("generation_failed"); return; }
    setResult({ lienId: permanentIdentity.lienId, lienName: payload.lienName, imageDataUrl: payload.imageDataUrl, edition: payload.edition || edition });
    setStep(7); setStatus("Card ready. Review and activate your living LIEN ID."); void track("generation_completed");
  }

  async function saveIdentity() {
    if (!result?.imageDataUrl || !permanentIdentity) return;
    setStatus("Activating your permanent LIEN ID and seasonal card.");
    const avatarResponse = await fetch("/api/lien/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageDataUrl: result.imageDataUrl, lienName: result.lienName, role, edition: result.edition || edition }) });
    const avatarPayload = await avatarResponse.json(); if (!avatarResponse.ok) { setStatus(avatarPayload.error || "Card activation failed."); return; }
    const response = await fetch("/api/liens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ humanName, lienName: result.lienName, role, seasonId: permanentIdentity.seasonId || "S01", portraitDataUrl: result.imageDataUrl, genesisStatus: "candidate" }) });
    const payload = await response.json(); if (!response.ok) { setStatus(payload.error || "Identity record could not be saved."); return; }
    setStatus("LIEN ID activated. Enter your first mission to begin building history."); await clearPortraitDraft(); void track("card_viewed");
  }

  async function downloadCard() { if (!cardRef.current) return; const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: "#020403" }); const link = document.createElement("a"); link.download = `${lienName}-${edition}-lien-id.png`; link.href = dataUrl; link.click(); }
  async function shareCard() { if (!cardRef.current || !permanentIdentity) return; setStatus(await shareLienCard({ card: cardRef.current, lienId: permanentIdentity.lienId, lienName, role, edition, seasonId: permanentIdentity.seasonId || "S01" })); }

  return <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-12 md:px-8">
    <header className="text-center"><p className="section-kicker">Level 51 guided intake</p><h1 className="section-title">Get Your LIEN ID</h1><p className="mx-auto mt-3 max-w-2xl text-zinc-300">Claim your LIEN ID. Enter the LIENIVERSE. Choose your path. Complete missions. Build your legacy.</p></header>
    <ol className="wizard-progress" aria-label="LIEN ID creation progress">{steps.map((label,index)=><li className={step===index+1?"active":step>index+1?"complete":""} key={label}><span>{step>index+1?<Check size={14}/>:index+1}</span>{label}</li>)}</ol>

    {step===1 && <HudPanel title="Step 1 · Connect Telegram" accent="#39FF14"><p className="max-w-2xl leading-7 text-zinc-200">Telegram secures the current LIEN account and connects the same identity used by LIEN Ascension. It is an authentication connection—not legal identity verification.</p>{permanentIdentity?<button className="primary-cta mt-5" onClick={()=>setStep(2)}>Telegram Connected · Continue</button>:<Link className="primary-cta mt-5" href="/lien-id#connect">Connect Telegram</Link>}</HudPanel>}

    {step===2 && <HudPanel title="Step 2 · Upload Your Photo" accent="#35ECFF"><div className="grid gap-5 md:grid-cols-[220px_1fr]"><div className="aspect-[4/5] overflow-hidden border border-cyan-300/40 bg-black/70">{portraitPreview? <img src={portraitPreview} alt="Private uploaded portrait preview" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center p-5 text-center text-zinc-500">No photo selected</div>}</div><div><ul className="grid gap-2 text-sm leading-6 text-zinc-200"><li>One person, front-facing or shoulders-up</li><li>Clear lighting; no sunglasses, masks, or heavy filters</li><li>JPG, PNG, or WEBP · maximum 8 MB</li><li>The draft stays in this browser through Stripe checkout</li></ul><label className="mt-4 flex gap-3 text-sm leading-6"><input type="checkbox" checked={aiConsent} onChange={e=>setAiConsent(e.target.checked)}/><span>I consent to AI processing of this photo and have permission to use it. <Link className="text-cyan-200 underline" href="/ai-image-consent">Read consent terms</Link>.</span></label><label className="secondary-cta mt-4 cursor-pointer">Choose Photo<input className="sr-only" type="file" accept={allowedTypes.join(",")} onChange={e=>updatePortrait(e.target.files?.[0]||null)}/></label></div></div><button className="primary-cta mt-5 disabled:opacity-40" disabled={!portrait||!aiConsent} onClick={()=>setStep(3)}>Continue</button></HudPanel>}

    {step===3 && <HudPanel title="Step 3 · Choose Your Name" accent="#39FF14"><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2"><span className="font-display uppercase">Human / display name</span><input className="form-control" value={humanName} onChange={e=>{setHumanName(e.target.value);if(!designation)setDesignation(makeLienName(e.target.value||"New"));}} maxLength={80}/><small className="text-zinc-400">How you want to be addressed.</small></label><label className="grid gap-2"><span className="font-display uppercase">LIEN designation</span><input className="form-control" value={designation} onChange={e=>{setDesignation(e.target.value);setDesignationState("idle");}} maxLength={40}/><small className="text-zinc-400">Your unique LIENIVERSE name. Letters, numbers, underscores, and hyphens.</small><button className="secondary-cta justify-self-start" onClick={checkDesignation} disabled={designationState==="checking"}>{designationState==="checking"?"Checking…":"Check Availability"}</button></label></div><button className="primary-cta mt-5 disabled:opacity-40" disabled={!humanName.trim()||designationState!=="available"} onClick={()=>setStep(4)}>Continue</button></HudPanel>}

    {step===4 && <HudPanel title="Step 4 · Choose Your Role" accent="#39FF14"><p className="mb-5 text-sm leading-6 text-zinc-300">Role means how you contribute—not rank or gameplay power. Builder creates the ecosystem, Creator grows its culture, and Strategist guides the mission.</p><div className="grid gap-4 md:grid-cols-3">{seasonOneRoles.map(item=>{const p=roleProfiles[item];return <button type="button" aria-pressed={role===item} className={`role-choice ${role===item?"selected":""}`} onClick={()=>{setRole(item);void track("role_selected")}} key={item}><span className="role-choice__emblem">{p.emblemGlyph}</span><strong>{item}</strong><p>{p.purpose}</p><small>{p.traits.join(" · ")}</small></button>})}</div><div className="mt-5 border border-amber-300/35 bg-amber-300/5 p-4"><strong className="font-display uppercase text-amber-200">DEN Guardian · Earned, not selected</strong><p className="mt-2 text-sm leading-6 text-zinc-300">DEN Guardians protect the ecosystem through trusted service, moderation, security, and community leadership. Only authorized administrators can appoint or revoke this designation. It cannot be purchased and provides no gameplay advantage.</p></div><div className="mt-5 border-l-2 border-lime-300 p-4"><strong className="font-display uppercase text-lime-200">{selectedRole.title}</strong><p className="mt-2 text-sm text-zinc-300">{selectedRole.charge}</p></div><button className="primary-cta mt-5" onClick={()=>setStep(5)}>Continue</button></HudPanel>}

    {step===5 && <HudPanel title="Step 5 · Choose Your Edition" accent="#d8b4fe"><EditionComparison compact/><div className="mt-4 grid gap-3 sm:grid-cols-2"><button aria-pressed={edition==="standard"} className={`edition-select ${edition==="standard"?"selected":""}`} onClick={()=>setEdition("standard")}>Signal · $3</button><button aria-pressed={edition==="holographic"} className={`edition-select ${edition==="holographic"?"selected":""}`} onClick={()=>setEdition("holographic")}>Holographic · $7</button></div><button className="primary-cta mt-5" onClick={()=>{setStep(6);void track("edition_selected")}}>Continue with {edition==="holographic"?"Holographic":"Signal"}</button></HudPanel>}

    {step===6 && <HudPanel title="Step 6 · Review and Pay" accent="#E7BA50"><div className="grid gap-6 md:grid-cols-[150px_1fr]"><div className="aspect-[4/5] overflow-hidden border border-amber-300/40">{portraitPreview&& <img src={portraitPreview} alt="Photo selected for AI processing" className="h-full w-full object-cover"/>}</div><div className="grid gap-2 text-zinc-200"><p><strong>Display name:</strong> {humanName}</p><p><strong>LIEN designation:</strong> {lienName}</p><p><strong>Role:</strong> {role}</p><p><strong>Edition:</strong> {edition==="holographic"?"Holographic · $7":"Signal · $3"}</p><p><strong>Permanent ID:</strong> {permanentIdentity?.lienId||"Not connected"}</p><p><strong>Payment:</strong> Card or eligible cryptocurrency through Stripe</p><p className="text-sm text-amber-100">One initial generation. Paid system failures remain recoverable. Do not pay twice.</p><p className="text-xs leading-5 text-zinc-400">Crypto availability is determined securely by Stripe. Eligible customers can connect a wallet in Stripe Checkout and pay with supported stablecoins; completed payments settle through the same verified order process.</p></div></div><label className="mt-5 flex gap-3 text-sm leading-6"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)}/><span>I accept the <Link href="/terms" className="underline">Terms</Link>, <Link href="/privacy" className="underline">Privacy Policy</Link>, <Link href="/refund-policy" className="underline">Refund Policy</Link>, and AI-processing consent.</span></label><div className="mt-5 flex flex-wrap gap-3">{generationReady?<button className="primary-cta disabled:opacity-40" disabled={generating||!portrait||!termsAccepted} onClick={transform}><Sparkles size={18}/>{generating?"LIENification in progress…":"Generate My LIEN ID"}</button>:<button className="primary-cta disabled:opacity-40" disabled={!termsAccepted||checkoutLoading} onClick={startCheckout}><LockKeyhole size={18}/>{checkoutLoading?"Opening Stripe…":`Pay ${edition==="holographic"?"$7":"$3"} · Card or Crypto`}</button>}<button className="secondary-cta" onClick={()=>setStep(5)}>Edit Choices</button></div>{orderStatus&&<p className="mt-5 border border-cyan-300/30 bg-cyan-300/5 p-4 font-display uppercase text-cyan-100">Order status: {orderStatus.replaceAll("_"," ")}</p>}</HudPanel>}

    {step===7 && <HudPanel title="Step 7 · Generate and Activate" accent="#39FF14"><div className="grid gap-6 md:grid-cols-[minmax(280px,390px)_1fr]">{result?.imageDataUrl&&permanentIdentity?<LienIdentityCard ref={cardRef} portraitUrl={result.imageDataUrl} lienId={permanentIdentity.lienId} lienName={result.lienName} role={role} edition={result.edition||edition} level={permanentIdentity.level||1} xp={permanentIdentity.xp||0} glb={permanentIdentity.glb||0} lifetimePoints={permanentIdentity.lifetimePoints||0} seasonId={permanentIdentity.seasonId||"S01"} seasonName={permanentIdentity.seasonName||"First Signal"} seasonPoints={permanentIdentity.seasonPoints||0}/>:<div className="clarity-card">Payment confirmed<br/>Portrait received<br/>Generation queued<br/>LIENification in progress<br/>Card ready</div>}<div className="grid content-start gap-3"><h2 className="font-display text-2xl font-black uppercase text-lime-200">Your living identity begins here</h2><p className="text-sm leading-6 text-zinc-300">Activate the card, then enter your first mission. GLB, XP, level, achievements, and seasonal progress will update through connected experiences.</p><button className="primary-cta" disabled={!result?.imageDataUrl} onClick={saveIdentity}>Activate Card</button><button className="secondary-cta" onClick={downloadCard}><Download size={18}/>Download Card</button><button className="secondary-cta" onClick={shareCard}><Share2 size={18}/>Share Card</button><Link className="primary-cta" href="https://t.me/LIENASCENSIONBOT/Play">First Mission · Enter the Signal</Link></div></div></HudPanel>}
    {status&&<p className="hud-panel clip-hud p-4 text-sm text-lime-100" aria-live="polite">{status}</p>}
  </section>;
}
