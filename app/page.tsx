import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Gamepad2, History, Sparkles, Star, UserRound } from "lucide-react";
import { EditionComparison } from "@/components/EditionComparison";
import { PageFrame } from "@/components/PageFrame";
import { StatusBadge } from "@/components/StatusBadge";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { pageImages } from "@/lib/content";

const identityFacts = [
  ["Permanent number", "Your LIEN ID number stays with your account."],
  ["Living progression", "GLB, XP, level, achievements, and items update as you participate."],
  ["Seasonal history", "New seasons can issue new cards while earlier cards remain archived."],
  ["Telegram connected", "One current sign-in connects the identity used by LIEN Ascension."],
] as const;

export default function Home() {
  return (
    <PageFrame image={pageImages.home} motion>
      <AnalyticsBeacon event="homepage_view" />
      <section className="mx-auto grid max-w-[1500px] items-center gap-9 px-4 pb-14 pt-10 md:min-h-[calc(100svh-6rem)] md:px-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-3xl">
          <StatusBadge status="beta" />
          <p className="font-display mt-5 text-sm font-black uppercase tracking-[.25em] text-cyan-200">LIEN ID · Season One Early Access</p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-[.92] text-white md:text-7xl xl:text-8xl">Claim your identity in the LIENIVERSE</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-100">
            Create a living seasonal identity connected to Telegram. Your LIEN ID carries your
            GLB, level, role, achievements, and history across DonLien experiences.
          </p>
          <p className="font-display mt-5 text-xl font-black uppercase text-lime-300">One identity. Every game. Every season.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/become-a-lien" className="primary-cta">Get Your LIEN ID</Link>
            <Link href="/mission-control" className="secondary-cta">Enter LIENIVERSE</Link>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">Signal $3 · Holographic $7 · Secure Stripe checkout by card or eligible crypto wallet.</p>
        </div>
        <div className="mx-auto w-full max-w-[470px]" aria-label="Holographic LIEN ID example">
          <div className="home-card-preview home-card-preview--holo">
            <Image src="/images/holographic-lien-id-season-01.png" alt="Example Holographic LIEN ID layout" width={520} height={850} priority />
            <span>Season One · Holographic Edition</span>
          </div>
          <p className="mt-4 text-center text-xs uppercase tracking-[.16em] text-zinc-300">Premium collectible presentation · Same progression as Signal</p>
        </div>
      </section>

      <section className="content-section">
        <div className="max-w-3xl">
          <p className="section-kicker">Permanent identity layer</p>
          <h2 className="section-title">What is a LIEN ID?</h2>
          <p className="section-copy">A living identity that carries your level, GLB, achievements, role, seasonal history, and progression across the LIENIVERSE.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {identityFacts.map(([title, copy]) => <article className="clarity-card" key={title}><BadgeCheck className="text-lime-300" /><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
        <p className="mt-6 text-sm leading-6 text-zinc-300">The QR code opens the card verification record. “Telegram Connected” confirms account authentication; it is not government identity verification. The current LIEN ID card is not an NFT.</p>
      </section>

      <section className="content-section border-y border-white/10 bg-black/45">
        <p className="section-kicker">Four clear steps</p><h2 className="section-title">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [UserRound, "1. Connect Telegram", "Secure your permanent LIEN identity with the account used across current DonLien experiences."],
            [Sparkles, "2. Upload Your Photo", "Upload one clear portrait for your personalized pixel LIEN character."],
            [Star, "3. Choose Your Path", "Choose Builder, Creator, or Strategist. DEN Guardian is an earned, administrator-appointed trust role."],
            [Gamepad2, "4. Activate Your Card", "Choose Signal or Holographic, pay securely, generate your card, then enter your first mission."],
          ].map(([Icon, title, copy]) => { const StepIcon = Icon as typeof UserRound; return <article className="clarity-card" key={title as string}><StepIcon className="text-cyan-200" /><h3>{title as string}</h3><p>{copy as string}</p></article>; })}
        </div>
      </section>

      <EditionComparison />

      <section id="roadmap" className="content-section">
        <StatusBadge status="beta" /><h2 className="section-title mt-4">Season One roadmap</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <article className="clarity-card"><Gamepad2 /><h3>Now · Enter the Signal</h3><p>LIEN ID, Telegram connection, LIEN Ascension, GLB, live cards, and secure Stripe checkout.</p></article>
          <article className="clarity-card"><History /><h3>Next · Seasonal archive</h3><p>Expanded archive browsing, achievements, items, referrals, and clearer recovery tools.</p><StatusBadge status="planned" /></article>
          <article className="clarity-card"><Star /><h3>Future · Genesis</h3><p>Planned 300-piece founding LIENFT collection. Minting is not active.</p><StatusBadge status="coming-soon" /></article>
        </div>
      </section>

      <section id="about-den" className="content-section border-t border-white/10">
        <p className="section-kicker">The network behind the story</p><h2 className="section-title">About DEN</h2>
        <p className="section-copy">DEN is the long-term infrastructure direction behind DonLien. The public experience starts with entertainment and identity; technical architecture stays behind the experience until users need it.</p>
      </section>
    </PageFrame>
  );
}
