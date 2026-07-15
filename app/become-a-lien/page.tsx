import { BecomeLienWizard } from "@/components/BecomeLienWizard";
import { PageFrame } from "@/components/PageFrame";
import { pageImages } from "@/lib/content";

export default function BecomeLienPage() {
  return (
    <PageFrame image={pageImages.home}>
      <section className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-6xl content-end gap-5 px-4 pb-10 md:px-8">
        <div className="max-w-3xl">
          <p className="font-display text-lime-300">INTAKE GUIDE</p>
          <h1 className="font-display text-5xl font-black uppercase md:text-7xl">Become a LIEN</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-100">
            DonLien oversees every new Level 51 identity activation.
          </p>
        </div>
        <div className="hud-panel clip-hud max-w-xl p-4">
          <p className="font-display text-xs font-bold uppercase text-lime-300">DonLien Outfit</p>
          <p className="font-display text-2xl font-black uppercase">LIEN Intake Guide</p>
          <p className="text-sm text-zinc-200">Blue presidential suit with red glowing DONLIEN tie</p>
        </div>
      </section>
      <BecomeLienWizard />
    </PageFrame>
  );
}
