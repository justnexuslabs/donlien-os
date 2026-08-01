import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { StatusBadge } from "@/components/StatusBadge";
import { pageImages } from "@/lib/content";

export default function PlayPage() {
  return <PageFrame image={pageImages.mission} accent="#35ECFF">
    <section className="content-section min-h-[70svh] content-center pt-16">
      <StatusBadge status="live" /><h1 className="section-title mt-4">Play inside the LIENIVERSE</h1>
      <p className="section-copy">Entertainment is the gateway. Start with LIEN Ascension, earn approved progression, and carry it through your connected LIEN ID.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="clarity-card border-cyan-300/50"><StatusBadge status="live" /><h2>LIEN Ascension</h2><p>Telegram Mini App merge game with GLB rewards, daily activity, and connected LIEN progression.</p><Link className="primary-cta mt-5" href="https://t.me/LIENASCENSIONBOT/Play">Play in Telegram</Link></article>
        <article className="clarity-card"><StatusBadge status="planned" /><h2>Future LIENIVERSE games</h2><p>Additional action, RPG, and community experiences are planned. No release date or gameplay reward is active yet.</p></article>
      </div>
    </section>
  </PageFrame>;
}
