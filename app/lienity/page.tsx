import Link from "next/link";
import { DonLienStoryDeck } from "@/components/DonLienStoryDeck";
import { HudPanel } from "@/components/HudPanel";
import { PageFrame } from "@/components/PageFrame";
import { donLienDecks, embassyCards, pageImages, pillars } from "@/lib/content";

export default function LienityPage() {
  return (
    <PageFrame image={pageImages.lienity} accent="#39FF14">
      <section className="mx-auto grid max-w-[1600px] gap-5 px-4 pb-10 md:px-8 xl:grid-cols-[320px_1fr_360px]">
        <div className="grid gap-4">
          <HudPanel title="LIENITY Status" accent="#39FF14">
            <p className="font-display text-5xl font-black">Demo 1,247</p>
            <p className="uppercase text-lime-200">Active LIENs placeholder</p>
            <p className="mt-5 font-display text-3xl">87+</p>
            <p className="uppercase text-zinc-200">Countries united</p>
          </HudPanel>
          <HudPanel title="Our Mission" accent="#39FF14">
            <p className="leading-7">Uniting every species, every mind, and every dream in the LIENIVERSE.</p>
          </HudPanel>
        </div>
        <div className="grid content-center text-center">
          <p className="font-display text-lime-300">DIPLOMAT</p>
          <h1 className="font-display text-7xl font-black uppercase text-yellow-200 md:text-9xl">LIENITY</h1>
          <p className="font-display text-2xl uppercase">Together, we build the LIENIVERSE</p>
          <Link href="/become-a-lien" className="clip-hud mx-auto mt-8 border border-lime-300 px-6 py-4 font-display font-bold uppercase text-lime-200">
            Become a LIEN
          </Link>
        </div>
        <div className="grid gap-4">
          <HudPanel title="LIENITY Pillars" accent="#39FF14">
            <div className="grid gap-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div className="flex gap-3 border border-lime-300/20 bg-black/30 p-3" key={pillar.title}>
                    <Icon className="shrink-0 text-lime-300" />
                    <div>
                      <strong className="font-display uppercase">{pillar.title}</strong>
                      <p className="text-sm text-zinc-300">{pillar.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </HudPanel>
        </div>
      </section>
      <DonLienStoryDeck {...donLienDecks.lienity} />
      <section className="mx-auto grid max-w-[1500px] gap-3 px-4 pb-8 md:grid-cols-4 md:px-8">
        {embassyCards.map((card) => (
          <HudPanel key={card.title} accent="#E7BA50">
            <h2 className="font-display text-xl font-black uppercase text-yellow-200">{card.title}</h2>
            <p className="mt-2 text-zinc-200">{card.copy}</p>
          </HudPanel>
        ))}
      </section>
    </PageFrame>
  );
}
