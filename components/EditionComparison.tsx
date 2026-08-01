import Link from "next/link";

export function EditionComparison({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`edition-comparison grid gap-4 md:grid-cols-2 ${compact ? "" : "mx-auto max-w-6xl px-4 py-14 md:px-8"}`}>
      <article className="clip-hud border border-lime-300/50 bg-black/75 p-6">
        <p className="font-display text-sm uppercase tracking-[.18em] text-lime-300">Signal Edition</p>
        <p className="font-display mt-2 text-5xl font-black text-white">$3</p>
        <ul className="mt-5 grid gap-2 text-sm leading-6 text-zinc-200">
          <li>Personalized pixel portrait</li><li>Dark Signal frame</li><li>Live GLB, XP, level, and season</li>
          <li>QR verification</li><li>Downloadable and shareable card</li><li>Seasonal card archive</li>
        </ul>
      </article>
      <article className="clip-hud holo-offer border border-fuchsia-300/60 bg-black/75 p-6">
        <p className="font-display text-sm uppercase tracking-[.18em] text-fuchsia-200">Holographic Edition</p>
        <p className="font-display mt-2 text-5xl font-black text-white">$7</p>
        <ul className="mt-5 grid gap-2 text-sm leading-6 text-zinc-200">
          <li>Everything in Signal</li><li>Premium metallic frame</li><li>Animated holographic foil</li>
          <li>Motion-responsive lighting</li><li>Glowing role emblem and edition badge</li><li>Genesis whitelist consideration eligibility</li>
        </ul>
      </article>
      <p className="md:col-span-2 border border-cyan-300/30 bg-cyan-300/5 p-4 text-sm leading-6 text-cyan-100">
        Both editions receive the same ecosystem access and progression. Holographic is a premium
        collectible presentation and does not provide gameplay advantages. Eligibility does not
        guarantee a Genesis mint, allocation, or purchase opportunity.
      </p>
      {!compact ? <Link href="/become-a-lien" className="primary-cta md:col-span-2">Get Your LIEN ID</Link> : null}
    </section>
  );
}
