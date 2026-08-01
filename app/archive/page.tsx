import { DonLienStoryDeck } from "@/components/DonLienStoryDeck";
import { HudPanel } from "@/components/HudPanel";
import { PageFrame } from "@/components/PageFrame";
import { archiveCategories, archiveRecords, donLienDecks, pageImages } from "@/lib/content";
import { StatusBadge } from "@/components/StatusBadge";

export default function ArchivePage() {
  return (
    <PageFrame image={pageImages.archive} accent="#D2A95D">
      <section className="mx-auto grid max-w-[1600px] gap-5 px-4 pb-10 md:px-8 xl:grid-cols-[310px_1fr_360px]">
        <div className="grid gap-4">
          <HudPanel title="Archive Status" accent="#D2A95D">
            <StatusBadge status="demo" />
            <p className="mt-3 font-display text-3xl font-black uppercase text-lime-200">Lore archive</p>
            <p className="uppercase">Public story excerpts—not live government records</p>
          </HudPanel>
          <HudPanel title="Recovered Files" accent="#D2A95D">
            {["Area 51", "Roswell", "First Contact", "Ancient Civilizations"].map((item) => (
              <p className="mb-3 uppercase text-zinc-200" key={item}>{item}</p>
            ))}
          </HudPanel>
        </div>
        <div className="grid content-center text-center">
          <p className="font-display text-amber-200">ARCHIVIST</p>
          <h1 className="font-display text-6xl font-black uppercase md:text-8xl">Archive Level 51</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">Cold-storage records, recovered artifacts, government files, and Genesis lore.</p>
        </div>
        <div className="grid gap-4">
          <HudPanel title="Archive Categories" accent="#D2A95D">
            <div className="grid gap-2">
              {archiveCategories.map((category) => (
                <details className="border border-amber-200/20 bg-black/30 p-3" key={category}>
                  <summary className="cursor-pointer font-display uppercase text-amber-100">{category}</summary>
                  <p className="mt-2 text-sm text-zinc-300">Classified record group. Public excerpt only.</p>
                </details>
              ))}
            </div>
          </HudPanel>
        </div>
      </section>
      <DonLienStoryDeck {...donLienDecks.archive} accent="#D2A95D" />
      <section className="mx-auto grid max-w-[1500px] gap-3 px-4 pb-8 md:grid-cols-5 md:px-8">
        <p className="md:col-span-5 text-sm text-amber-100">DEMO lore entries. Dates and categories below are fictional LIENIVERSE story metadata.</p>
        {archiveRecords.map((record) => (
          <HudPanel key={record.title} accent="#D2A95D">
            <p className="font-display text-lg font-black uppercase text-amber-100">{record.title}</p>
            <p className="text-sm text-lime-200">{record.date}</p>
            <p className="mt-2 text-xs uppercase text-zinc-300">{record.category}</p>
          </HudPanel>
        ))}
      </section>
    </PageFrame>
  );
}
