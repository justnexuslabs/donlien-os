import Image from "next/image";
import type { CSSProperties } from "react";

type DonLienPortraitProps = {
  src: string;
  role: string;
  outfit: string;
  accent?: string;
  objectPosition?: string;
  className?: string;
};

export function DonLienPortrait({
  src,
  role,
  outfit,
  accent = "#39FF14",
  objectPosition = "50% 42%",
  className = "",
}: DonLienPortraitProps) {
  return (
    <figure
      className={`hud-panel clip-hud relative mx-auto grid w-full max-w-[460px] overflow-hidden p-3 ${className}`}
      style={{ "--accent": accent } as CSSProperties}
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-black">
        <Image
          src={src}
          alt={`DonLien as ${role} wearing ${outfit}`}
          fill
          priority
          sizes="(max-width: 768px) 88vw, 430px"
          className="scale-[1.78] object-cover saturate-[1.18] contrast-[1.08]"
          style={{ objectPosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-black/14" />
      </div>
      <figcaption className="absolute bottom-5 left-5 right-5">
        <p className="font-display text-xs font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
          DonLien Outfit
        </p>
        <p className="font-display text-2xl font-black uppercase text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">
          {role}
        </p>
        <p className="text-sm text-zinc-200">{outfit}</p>
      </figcaption>
    </figure>
  );
}
