import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { SiteNav } from "./SiteNav";

type PageFrameProps = {
  image: string;
  accent?: string;
  children: ReactNode;
};

export function PageFrame({ image, accent = "#39FF14", children }: PageFrameProps) {
  return (
    <main className="page-shell relative overflow-hidden" style={{ "--accent": accent } as CSSProperties}>
      <div className="bg-reference">
        <Image src={image} alt="" fill priority sizes="100vw" />
      </div>
      <div className="scanlines" />
      <SiteNav />
      <div className="relative z-10 pt-24">{children}</div>
    </main>
  );
}
