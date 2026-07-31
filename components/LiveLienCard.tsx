"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";
import type { LienProfile } from "@/lib/lien-session";
import { shareLienCard } from "@/lib/share-lien-card";
import { LienIdentityCard } from "./LienIdentityCard";

export function LiveLienCard({ initialProfile }: { initialProfile: LienProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [status, setStatus] = useState("Live profile connected");
  const cardRef = useRef<HTMLElement>(null);

  async function refresh() {
    const response = await fetch("/api/lien/profile", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.profile) {
      setStatus(payload.error || "Live profile refresh failed");
      return;
    }
    setProfile(payload.profile);
    setStatus(`Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
  }

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  async function download() {
    if (!cardRef.current) return;
    setStatus("Preparing full-resolution card");
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#020403",
    });
    const link = document.createElement("a");
    link.download = `${profile.lienName}-${profile.cardEdition}-${profile.seasonId}.png`;
    link.href = dataUrl;
    link.click();
    setStatus("Verified card downloaded");
  }

  async function shareToX() {
    if (!cardRef.current) return;
    setStatus("Preparing your verified card for X");
    try {
      setStatus(
        await shareLienCard({
          card: cardRef.current,
          lienId: profile.lienId,
          lienName: profile.lienName,
          role: profile.role,
          edition: profile.cardEdition,
          seasonId: profile.seasonId,
        }),
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Sharing canceled");
        return;
      }
      setStatus(error instanceof Error ? error.message : "Could not open X sharing");
    }
  }

  if (!profile.avatarUrl) {
    return (
      <div className="hud-panel clip-hud border border-amber-300/50 p-5">
        Generate and save a pixel portrait to activate your live seasonal card.
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-[minmax(300px,420px)_1fr]">
      <LienIdentityCard
        ref={cardRef}
        portraitUrl={profile.avatarUrl}
        lienId={profile.lienId}
        lienName={profile.lienName}
        role={profile.role}
        edition={profile.cardEdition}
        level={profile.level}
        xp={profile.xp}
        glb={profile.glb}
        lifetimePoints={profile.lifetimePoints}
        seasonId={profile.seasonId}
        seasonName={profile.seasonName}
        seasonPoints={profile.seasonPoints}
      />
      <div className="hud-panel clip-hud self-start border border-cyan-300/40 p-5">
        <p className="font-display text-xl font-black uppercase text-cyan-200">
          Live {profile.cardEdition} card
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          GLB, XP, level, seasonal points, and lifetime points refresh from LIEN Ascension every
          30 seconds. The QR code always opens the signed verification record.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => void refresh()}
            className="clip-hud inline-flex items-center justify-center gap-2 border border-cyan-300 px-4 py-3 font-display uppercase text-cyan-100"
          >
            <RefreshCw size={17} /> Refresh now
          </button>
          <button
            onClick={() => void download()}
            className="clip-hud inline-flex items-center justify-center gap-2 border border-lime-300 px-4 py-3 font-display uppercase text-lime-100"
          >
            <Download size={17} /> Download card
          </button>
          <button
            onClick={() => void shareToX()}
            className="clip-hud inline-flex items-center justify-center gap-2 border border-fuchsia-300 px-4 py-3 font-display uppercase text-fuchsia-100"
          >
            <Share2 size={17} /> Share to X
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href={`/verify/${profile.lienId}`} className="clip-hud border border-cyan-300/70 px-4 py-3 text-center font-display uppercase text-cyan-100">
            Verify card
          </Link>
          <Link href="https://t.me/LIENASCENSIONBOT/Play" className="clip-hud border border-lime-300/70 px-4 py-3 text-center font-display uppercase text-lime-100">
            Play Ascension
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center text-xs uppercase tracking-wider text-zinc-300">
          <div><strong className="block text-lg text-yellow-100">{profile.inventory.length}</strong>Items</div>
          <div><strong className="block text-lg text-cyan-100">{profile.achievements.length}</strong>Achievements</div>
          <div><strong className="block text-lg text-fuchsia-100">{profile.referrals}</strong>Referrals</div>
        </div>
        <p className="mt-4 text-xs uppercase tracking-widest text-lime-200">{status}</p>
        <form action="/api/lien/logout" method="post" className="mt-4">
          <button className="w-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-zinc-400">Disconnect</button>
        </form>
      </div>
    </section>
  );
}
