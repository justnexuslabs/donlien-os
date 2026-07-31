"use client";

import { forwardRef, useState, type CSSProperties, type PointerEvent } from "react";
import { BadgeCheck, BarChart3, Globe2, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { roleProfiles, roles } from "@/lib/content";

type LienRole = (typeof roles)[number];

export type LienCardData = {
  portraitUrl: string;
  lienId: string;
  lienName: string;
  role: string;
  edition: "standard" | "holographic";
  level: number;
  xp: number;
  glb: number;
  lifetimePoints: number;
  seasonId: string;
  seasonName: string;
  seasonPoints: number;
};

export const LienIdentityCard = forwardRef<HTMLElement, LienCardData>(
  function LienIdentityCard(data, ref) {
    const [tilt, setTilt] = useState({ x: 0, y: 0, glowX: 50, glowY: 30 });
    const role = roles.includes(data.role as LienRole) ? (data.role as LienRole) : "Builder";
    const profile = roleProfiles[role];
    const holographic = data.edition === "holographic";
    const nextXp = 100 * Math.max(1, data.level) ** 2;
    const previousXp = data.level <= 1 ? 0 : 100 * (data.level - 1) ** 2;
    const progress = Math.max(
      0,
      Math.min(100, ((data.xp - previousXp) / Math.max(1, nextXp - previousXp)) * 100),
    );
    const verifyUrl = `https://donlien.xyz/verify/${encodeURIComponent(data.lienId)}`;
    const style = {
      "--card-rx": `${tilt.x}deg`,
      "--card-ry": `${tilt.y}deg`,
      "--card-glow-x": `${tilt.glowX}%`,
      "--card-glow-y": `${tilt.glowY}%`,
    } as CSSProperties;

    function move(event: PointerEvent<HTMLElement>) {
      if (!holographic) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      setTilt({ x: (0.5 - y) * 10, y: (x - 0.5) * 12, glowX: x * 100, glowY: y * 100 });
    }

    return (
      <article
        ref={ref}
        className={`lien-card ${holographic ? "lien-card--holographic" : "lien-card--standard"}`}
        style={style}
        onPointerMove={move}
        onPointerLeave={() => setTilt({ x: 0, y: 0, glowX: 50, glowY: 30 })}
        aria-label={`${data.lienName} ${data.edition} LIEN identity card`}
      >
        <div className="lien-card__foil" aria-hidden="true" />
        {holographic ? (
          <div className="lien-card__holo-crown" aria-hidden="true">
            <span>LIEN-ID</span>
            <small>HOLOGRAPHIC EDITION</small>
          </div>
        ) : null}
        <header className="lien-card__header">
          <div>
            <p className="lien-card__brand">LIEN-ID</p>
            <p className="lien-card__season">{data.seasonId} · {data.seasonName}</p>
          </div>
          <div className="lien-card__seal">
            <BadgeCheck size={20} />
            <span>VERIFIED</span>
          </div>
        </header>

        <div className="lien-card__portrait">
          {/* Generated portrait data URLs cannot be optimized by next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.portraitUrl} alt={`${data.lienName} LIEN portrait`} />
          <div className="lien-card__role-mark">{profile.insignia}</div>
        </div>

        <div className="lien-card__identity">
          <p className="lien-card__name">{data.lienName}</p>
          <p className="lien-card__role">{role} · LEVEL {data.level}</p>
          <p className="lien-card__id"><span>{data.lienId}</span></p>
        </div>

        <div className="lien-card__data">
          <div><Globe2 size={14} /><span>GLB BALANCE</span><strong>{data.glb.toLocaleString()}</strong></div>
          <div><ShieldCheck size={14} /><span>LIFETIME</span><strong>{data.lifetimePoints.toLocaleString()}</strong></div>
          <div><BarChart3 size={14} /><span>SEASON</span><strong>{data.seasonPoints.toLocaleString()}</strong></div>
          <div className="lien-card__qr">
            <QRCodeSVG value={verifyUrl} size={58} bgColor="#eefdf0" fgColor="#05120a" level="M" />
          </div>
        </div>

        <div className="lien-card__xp">
          <div style={{ width: `${progress}%` }} />
        </div>
        <p className="lien-card__xp-label">{data.xp.toLocaleString()} / {nextXp.toLocaleString()} XP</p>

        <footer className="lien-card__footer">
          <span>{holographic ? "HOLOGRAPHIC" : "STANDARD"} EDITION</span>
          <span>{data.seasonId}</span>
        </footer>
      </article>
    );
  },
);
