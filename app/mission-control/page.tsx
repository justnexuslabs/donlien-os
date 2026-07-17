import { DonLienStoryDeck } from "@/components/DonLienStoryDeck";
import { HologramGlobe } from "@/components/HologramGlobe";
import { HudPanel } from "@/components/HudPanel";
import { PageFrame } from "@/components/PageFrame";
import { donLienDecks, liveFeeds, missionStats, objectives, pageImages } from "@/lib/content";

export default function MissionControlPage() {
  return (
    <PageFrame image={pageImages.mission} accent="#35ECFF">
      <section className="mx-auto grid max-w-[1600px] gap-4 px-4 pb-10 md:px-8 xl:grid-cols-[330px_1fr_330px]">
        <div className="grid gap-4">
          <HudPanel title="Mission Status" accent="#35ECFF">
            <p className="font-display text-2xl uppercase">LIENIVERSE Network</p>
            <p className="font-display text-xl font-black text-cyan-300">Operational</p>
            <div className="mt-5 h-2 bg-cyan-300" />
            <p className="mt-3 text-sm uppercase text-zinc-300">Global Nodes 51 / 51</p>
          </HudPanel>
          <HudPanel title="Objectives" accent="#35ECFF">
            <ul className="space-y-3">
              {objectives.map((item) => (
                <li className="flex gap-3 text-sm uppercase tracking-wide" key={item}>
                  <span className="mt-1 size-3 rounded-full bg-cyan-300 shadow-[0_0_16px_#35ECFF]" />
                  {item}
                </li>
              ))}
            </ul>
          </HudPanel>
          <HudPanel title="Network Stability" accent="#35ECFF">
            <p className="font-display text-5xl font-black text-cyan-200">99.8%</p>
          </HudPanel>
        </div>
        <div className="grid content-end gap-6 pt-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-cyan-300">COMMAND STRATEGIST</p>
            <h1 className="font-display text-5xl font-black uppercase md:text-7xl">Mission Control</h1>
          </div>
          <HologramGlobe accent="#35ECFF" />
        </div>
        <div className="grid gap-4">
          <HudPanel title="Command Override" accent="#35ECFF">
            <p className="font-display text-3xl uppercase">Build the LIENIVERSE</p>
            <p className="mt-4 text-cyan-200">Commander in Chief authorization active.</p>
          </HudPanel>
          <HudPanel title="Live Feed Grid" accent="#35ECFF">
            <div className="grid grid-cols-2 gap-3">
              {liveFeeds.map((feed) => (
                <div className="border border-cyan-300/30 bg-cyan-300/5 p-3 text-xs uppercase" key={feed}>
                  {feed}
                </div>
              ))}
            </div>
          </HudPanel>
        </div>
      </section>
      <DonLienStoryDeck {...donLienDecks.mission} accent="#35ECFF" />
      <section className="mx-auto grid max-w-[1600px] gap-3 px-4 pb-8 md:grid-cols-4 md:px-8">
        {missionStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <HudPanel key={stat.label} accent="#35ECFF">
              <Icon className="mb-4 text-cyan-300" size={32} />
              <p className="font-display text-sm uppercase text-cyan-200">{stat.label}</p>
              <p className="font-display text-4xl font-black uppercase">{stat.value}</p>
              <p className="text-sm uppercase text-zinc-300">{stat.copy}</p>
            </HudPanel>
          );
        })}
      </section>
    </PageFrame>
  );
}
