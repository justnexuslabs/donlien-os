import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
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
      <div className={`bg-reference ${motion ? "bg-reference-motion" : ""}`}>
        <Image src={image} alt="" fill priority sizes="100vw" />
      </div>
      <div className="scanlines" />
      <SiteNav />
      <div className="relative z-10 pt-24">{children}</div>
    </main>
  );
}
