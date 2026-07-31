import { cookies } from "next/headers";
import Link from "next/link";
import { HudPanel } from "@/components/HudPanel";
import { PageFrame } from "@/components/PageFrame";
import { TelegramLienLogin } from "@/components/TelegramLienLogin";
import { LiveLienCard } from "@/components/LiveLienCard";
import { readLienSession } from "@/lib/lien-session";
import { pageImages } from "@/lib/content";

export default async function LienIdPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = readLienSession((await cookies()).get("lien_session")?.value);
  const { error } = await searchParams;
  const nextXp = 100 * Math.max(1, profile?.level || 1) ** 2;
  const progress = Math.min(100, Math.round(((profile?.xp || 0) / nextXp) * 100));

  return (
    <PageFrame image={pageImages.lienity} accent="#39FF14">
      <section className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-5xl content-center gap-6 px-4 pb-12 md:px-8">
        <div>
          <p className="font-display text-sm font-black uppercase tracking-[0.24em] text-lime-300">
            Universal LIEN Account
          </p>
          <h1 className="font-display mt-2 text-5xl font-black uppercase md:text-7xl">
            LIEN ID
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-200">
            One identity, balance, level, and collection across the LIENIVERSE.
          </p>
        </div>
        {profile ? (
          <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
            <HudPanel title="Identity Confirmed" accent="#39FF14">
              {profile.avatarUrl ? (
                <div className="mb-5 aspect-square max-w-52 overflow-hidden border border-lime-300/50 bg-black/70">
                  {/* Permanent cross-site LIEN avatar. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.lienName} pixel LIEN portrait`}
                    className="h-full w-full object-cover [image-rendering:pixelated]"
                  />
                </div>
              ) : null}
              <p className="font-display text-sm uppercase text-zinc-300">Permanent ID</p>
              <p className="font-display mt-1 break-all text-3xl font-black text-lime-300">
                {profile.lienId}
              </p>
              <h2 className="font-display mt-5 text-4xl font-black uppercase">
                {profile.lienName}
              </h2>
              <p className="uppercase text-zinc-300">{profile.class} · Level {profile.level}</p>
              <p className="mt-1 uppercase text-cyan-200">{profile.role || "Unassigned"} · {profile.cardEdition || "standard"} edition</p>
              <div className="mt-5 h-3 overflow-hidden border border-lime-400/40 bg-black/70">
                <div className="h-full bg-lime-400" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-zinc-300">{profile.xp} / {nextXp} XP</p>
            </HudPanel>
            <div className="grid gap-4">
              <HudPanel title="Galactic Lien Bucks" accent="#E7BA50">
                <p className="font-display text-4xl font-black text-yellow-200">
                  {profile.glb.toLocaleString()} GLB
                </p>
              <p className="mt-2 text-sm text-zinc-300">
                  {(profile.lifetimePoints ?? profile.lifetimeEarned ?? 0).toLocaleString()} lifetime points
                </p>
              </HudPanel>
              <HudPanel title={`${profile.seasonId || "S01"} · ${profile.seasonName || "First Signal"}`} accent="#35ECFF">
                <p className="font-display text-4xl font-black text-cyan-200">
                  {(profile.seasonPoints || 0).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Seasonal leaderboard points reset when this card retires.
                </p>
              </HudPanel>
              <HudPanel title="Collection" accent="#35ECFF">
                <p>{profile.inventory.length} owned items</p>
                <p>{profile.achievements.length} achievements</p>
                <p>{profile.referrals} referrals</p>
              </HudPanel>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Link
                href={`/verify/${profile.lienId}`}
                className="clip-hud border border-cyan-300 px-6 py-4 font-display font-bold uppercase text-cyan-200"
              >
                Verify Card
              </Link>
              <Link
                href="https://t.me/LIENASCENSIONBOT/Play"
                className="clip-hud border border-lime-400 bg-lime-400/10 px-6 py-4 font-display font-bold uppercase text-lime-200"
              >
                Play LIEN Ascension
              </Link>
              <form action="/api/lien/logout" method="post">
                <button className="clip-hud border border-white/30 px-6 py-4 font-display font-bold uppercase">
                  Disconnect
                </button>
              </form>
            </div>
            <div className="md:col-span-2">
              <LiveLienCard initialProfile={profile} />
            </div>
          </div>
        ) : (
          <HudPanel title="Connect LIEN ID" accent="#39FF14">
            <p className="mb-5 max-w-xl text-zinc-200">
              Sign in with the same Telegram account used in LIEN ASCENSION.
              Your private Telegram ID is never displayed or stored in the browser.
            </p>
            {error ? <p className="mb-4 text-red-300">{error}</p> : null}
            <TelegramLienLogin />
          </HudPanel>
        )}
      </section>
    </PageFrame>
  );
}
