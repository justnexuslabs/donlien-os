"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { DonLienBadgeIcon } from "./DonLienBadgeIcon";

const publicItems = [
  { href: "/", label: "Home" },
  { href: "/lien-id", label: "LIEN ID" },
  { href: "/play", label: "Play" },
  { href: "/genesis", label: "Genesis" },
];

const exploreItems = [
  { href: "/mission-control", label: "Mission Control" },
  { href: "/lienity", label: "LIENITY" },
  { href: "/archive", label: "Archive" },
  { href: "/#roadmap", label: "Roadmap" },
  { href: "/#about-den", label: "About DEN" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-lime-400/25 bg-black/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="font-display flex items-center gap-3 text-2xl font-black tracking-wide">
          <span className="donlien-nav-badge grid size-12 place-items-center text-lime-300" aria-hidden="true">
            <DonLienBadgeIcon className="size-11" />
          </span>
          <span>
            DONLIEN<span className="text-lime-400">.XYZ</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
          {publicItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                className={`font-display px-5 py-3 text-base font-bold uppercase tracking-wide transition ${
                  active ? "text-lime-300 shadow-[inset_0_-2px_0_#39FF14]" : "text-zinc-200 hover:text-lime-300"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
          <details className="nav-explore relative">
            <summary className="font-display cursor-pointer list-none px-5 py-3 text-base font-bold uppercase tracking-wide text-zinc-200 hover:text-lime-300">Explore</summary>
            <div className="absolute right-0 top-full grid min-w-56 gap-1 border border-lime-400/30 bg-black/95 p-2 shadow-2xl">
              {exploreItems.map((item) => <Link className="px-4 py-3 font-display text-sm font-bold uppercase text-zinc-200 hover:bg-lime-400/10 hover:text-lime-200" href={item.href} key={item.href}>{item.label}</Link>)}
            </div>
          </details>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/lien-id"
            className="clip-hud hidden border border-cyan-300/70 px-5 py-3 font-display font-bold uppercase text-cyan-200 md:inline-flex"
          >
            Connect LIEN ID
          </Link>
          <Link
            href="/become-a-lien"
            className="clip-hud hidden border border-lime-400/70 px-5 py-3 font-display font-bold uppercase text-lime-300 shadow-[0_0_18px_rgba(57,255,20,0.24)] sm:inline-flex"
          >
            Get Your LIEN ID
          </Link>
          <button
            className="grid size-11 place-items-center border border-lime-400/45 text-lime-300 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-menu" className="border-t border-lime-400/20 bg-black/95 px-4 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="grid gap-2">
            {[
              ...publicItems,
              ...exploreItems,
              { href: "/lien-id", label: "Connect LIEN ID" },
              { href: "/become-a-lien", label: "Get Your LIEN ID" },
            ].map((item) => (
              <Link
                className="font-display min-h-11 px-3 py-3 text-lg font-bold uppercase tracking-wide text-zinc-100 hover:bg-lime-400/10 hover:text-lime-300"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
