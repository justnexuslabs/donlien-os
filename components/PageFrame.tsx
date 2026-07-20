import type { CSSProperties, ReactNode } from "react";
import { AmbientGlow } from "./AmbientGlow";
import { SiteNav } from "./SiteNav";

type PageFrameProps = {
  image: string;
  accent?: string;
  motion?: boolean;
  children: ReactNode;
};

export function PageFrame({ image, accent = "#39FF14", motion = false, children }: PageFrameProps) {
  return (
    <main className="page-shell relative overflow-hidden" style={{ "--accent": accent } as CSSProperties}>
      <AmbientGlow image={image} motion={motion} />
      <SiteNav />
      <div className="relative z-10 pt-24">{children}</div>
    </main>
  );
}
