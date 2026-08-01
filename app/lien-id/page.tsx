import { cookies } from "next/headers";
import Link from "next/link";
import { EditionComparison } from "@/components/EditionComparison";
import { HudPanel } from "@/components/HudPanel";
import { LienFaq } from "@/components/LienFaq";
import { LiveLienCard } from "@/components/LiveLienCard";
import { PageFrame } from "@/components/PageFrame";
import { StatusBadge } from "@/components/StatusBadge";
import { TelegramLienLogin } from "@/components/TelegramLienLogin";
import { readLienSession } from "@/lib/lien-session";
import { pageImages } from "@/lib/content";

export default async function LienIdPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = readLienSession((await cookies()).get("lien_session")?.value);
  const { error } = await searchParams;
  return (
    <PageFrame image={pageImages.lienity} accent="#39FF14">
      <section className="content-section min-h-[70svh] content-center pt-16">
        <StatusBadge status="beta" />
        <p className="section-kicker mt-5">One identity · every game · every season</p>
        <h1 className="section-title max-w-4xl">Your living identity inside the LIENIVERSE</h1>
        <p className="section-copy">Your permanent LIEN ID connects to Telegram and carries your role, GLB, XP, level, achievements, items, referrals, and seasonal history across current and future DonLien experiences.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/become-a-lien" className="primary-cta">Get Your LIEN ID</Link>
          {!profile ? <a href="#connect" className="secondary-cta">Connect Existing LIEN ID</a> : null}
        </div>
      </section>

      <section className="content-section border-y border-white/10 bg-black/55">
        <h2 className="section-title">Permanent identity. Seasonal cards.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["LIEN ID number", "Permanent. It does not change when a season retires."],
            ["Seasonal card", "A visual record for one season. Prior cards remain in your archive."],
            ["Level and seasonal XP", "Seasonal progression may reset or change when a new season begins."],
            ["Lifetime history", "Lifetime points, achievements, purchases, and archived records remain attached."],
            ["GLB", "Available GLB and lifetime earnings are separate concepts and update from the LIEN Ascension backend."],
            ["QR record", "Opens the LIEN card verification record. It does not verify legal identity."],
          ].map(([title, copy]) => <article className="clarity-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section id="connect" className="content-section">
        <p className="section-kicker">Returning LIEN</p><h2 className="section-title">Connect LIEN ID</h2>
        {profile ? <div id="live-card"><LiveLienCard initialProfile={profile} /></div> : (
          <HudPanel title="Connect with Telegram" accent="#39FF14">
            <p className="mb-5 max-w-xl text-zinc-200">Use the same Telegram account used in LIEN Ascension. Telegram is the current authentication connection; your private Telegram numeric ID is not displayed in the browser.</p>
            {error ? <p className="mb-4 text-red-300" role="alert">{error}</p> : null}
            <TelegramLienLogin />
          </HudPanel>
        )}
      </section>

      <section className="content-section border-y border-white/10 bg-black/45">
        <h2 className="section-title">Choose an edition</h2><div className="mt-7"><EditionComparison compact /></div>
      </section>

      <section id="glb-guide" className="content-section">
        <p className="section-kicker">Reward guide</p><h2 className="section-title">What is GLB?</h2>
        <p className="section-copy">Galactic LIEN Bucks are earned through approved game activity, daily rewards, missions, and ecosystem participation. Available GLB can support rewards and marketplace uses as they become active; lifetime points preserve progression history.</p>
        <div className="mt-6 border border-amber-300/30 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100">GLB is an in-ecosystem reward and progression unit. It is not currently cryptocurrency, cash, transferable value, or a promise of future $DEN conversion. Season-reset and marketplace redemption rules will be published before those features activate.</div>
      </section>

      <section className="content-section border-t border-white/10"><h2 className="section-title">LIEN ID FAQ</h2><div className="mt-7"><LienFaq /></div></section>
    </PageFrame>
  );
}
