import Link from "next/link";
import type { CSSProperties } from "react";
import { DonLienStoryDeck } from "@/components/DonLienStoryDeck";
import { HudPanel } from "@/components/HudPanel";
import { PageFrame } from "@/components/PageFrame";
import { donLienDecks, pageImages, rarity } from "@/lib/content";

export default function GenesisPage() {
  return (
    <PageFrame image={pageImages.genesis} accent="#E7BA50">
      <section className="mx-auto grid max-w-[1600px] gap-5 px-4 pb-10 md:px-8 xl:grid-cols-[330px_1fr_380px]">
        <div className="grid gap-4">
          <HudPanel title="Command Status" accent="#E7BA50">
            <p className="font-display text-6xl font-black text-yellow-200">300</p>
            <p className="uppercase text-yellow-100">Founding LIENs</p>
            <p className="mt-5 font-display text-3xl">0 / 300</p>
            <p className="text-sm uppercase">LIENs minted</p>
          </HudPanel>
          <HudPanel title="Collection Status" accent="#E7BA50">
            {["Mint Price TBA", "Launch Window TBA", "Genesis Pending", "Hedera Hashgraph", "Non-inflationary"].map((item) => (
              <p className="mb-2 uppercase text-zinc-100" key={item}>{item}</p>
            ))}
          </HudPanel>
        </div>
        <div className="grid place-items-center py-10 text-center">
          <div className="hud-panel clip-hud max-w-xl p-8" style={{ "--accent": "#E7BA50" } as CSSProperties}>
            <p className="font-display text-yellow-200">FOUNDING LIEN BADGE</p>
            <h1 className="font-display mt-2 text-5xl font-black uppercase md:text-7xl">Genesis Vault</h1>
            <p className="mt-5 text-lg leading-8">Only 300 will ever exist. The first, the rarest, the OG.</p>
            <Link href="/become-a-lien" className="clip-hud mt-7 inline-flex border border-yellow-300 px-6 py-4 font-display font-bold uppercase text-yellow-200">
              Join Waitlist
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          <HudPanel title="Rarity Grid" accent="#E7BA50">
            <div className="grid gap-3">
              {rarity.map((item) => (
                <div className="grid grid-cols-[1fr_auto] border-b border-white/10 pb-2" key={item.name}>
                  <span className="uppercase" style={{ color: item.color }}>{item.name}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_auto] pt-2 font-display text-xl font-black">
                <span>Total</span>
                <span>300</span>
              </div>
            </div>
          </HudPanel>
          <HudPanel title="LIEN DNA Verified" accent="#E7BA50">
            <p className="leading-7">Immutable, permanent, unforged. Public minting is not active.</p>
          </HudPanel>
        </div>
      </section>
      <DonLienStoryDeck {...donLienDecks.genesis} accent="#E7BA50" />
    </PageFrame>
  );
}
