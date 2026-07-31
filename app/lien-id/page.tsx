import { cookies } from "next/headers";
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
          <LiveLienCard initialProfile={profile} />
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
