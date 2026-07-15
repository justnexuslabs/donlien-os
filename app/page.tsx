import Link from "next/link";
import { HudPanel } from "@/components/HudPanel";
import { PageFrame } from "@/components/PageFrame";
import { homeValues, pageImages } from "@/lib/content";

export default function Home() {
  return (
    <PageFrame image={pageImages.home}>
      <section className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-[1600px] items-end gap-8 px-4 pb-8 md:px-8 xl:grid-cols-[1fr_380px]">
        <div className="order-1 max-w-3xl xl:order-none">
          <p className="font-display text-2xl font-black uppercase tracking-[0.08em] text-lime-300">Welcome to the</p>
          <h1 className="font-display mt-1 text-6xl font-black uppercase leading-[0.86] tracking-wide text-zinc-100 md:text-8xl xl:text-9xl">
            LIENIVERSE
          </h1>
          <p className="font-display mt-5 text-2xl font-bold uppercase tracking-[0.08em] text-lime-300">
            UNITING CIVILIZATIONS. BUILDING LEGACIES.
          </p>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-100">
            From beyond the stars, we didn&apos;t come to conquer. We came to connect. Together, we build the LIENIVERSE.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/mission-control" className="clip-hud border border-lime-400 bg-lime-400/10 px-6 py-4 font-display font-bold uppercase text-lime-200">
              Enter the LIENIVERSE
            </Link>
            <Link href="/become-a-lien" className="clip-hud border border-white/30 px-6 py-4 font-display font-bold uppercase text-white">
              Become a LIEN
            </Link>
          </div>
        </div>
        <div className="order-2 grid gap-4 xl:order-none xl:self-end">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <HudPanel title="Global Network" accent="#39FF14">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-display text-4xl font-black">Demo 51</p>
                  <p className="text-sm uppercase text-lime-200">Node simulation</p>
                </div>
                <div>
                  <p className="font-display text-4xl font-black">87</p>
                  <p className="text-sm uppercase text-lime-200">Embassy regions placeholder</p>
                </div>
              </div>
            </HudPanel>
            <HudPanel title="The Mission" accent="#39FF14">
              <p className="leading-7 text-zinc-200">
                Building a decentralized future where every species, every mind, and every dream has a place to thrive.
              </p>
            </HudPanel>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1500px] gap-3 px-4 pb-8 md:grid-cols-4 md:px-8">
        {homeValues.map((value) => {
          const Icon = value.icon;
          return (
            <div className="hud-panel clip-hud flex items-center gap-3 p-4" key={value.title}>
              <Icon className="text-lime-300" />
              <span className="font-display font-bold uppercase">{value.title}</span>
            </div>
          );
        })}
      </section>
    </PageFrame>
  );
}
