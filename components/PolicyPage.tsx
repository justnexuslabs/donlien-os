import type { ReactNode } from "react";
import { PageFrame } from "./PageFrame";
import { pageImages } from "@/lib/content";

export function PolicyPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <PageFrame image={pageImages.archive} accent="#67e8f9"><article className="content-section min-h-[75svh] pt-16"><p className="section-kicker">Season One Early Access Policy</p><h1 className="section-title">{title}</h1><p className="section-copy">{intro}</p><div className="policy-copy mt-8 grid gap-7">{children}</div><p className="mt-10 text-xs text-zinc-500">Last updated August 1, 2026. This beta policy should receive legal review before a broad public launch.</p></article></PageFrame>;
}
