import { BecomeLienWizard } from "@/components/BecomeLienWizard";
import { DonLienPortrait } from "@/components/DonLienPortrait";
import { PageFrame } from "@/components/PageFrame";
import { pageImages } from "@/lib/content";

export default function BecomeLienPage() {
  return (
    <PageFrame image={pageImages.home}>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-6 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid content-center">
          <p className="font-display text-lime-300">INTAKE GUIDE</p>
          <h1 className="font-display text-5xl font-black uppercase md:text-7xl">Become a LIEN</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-100">
            DonLien oversees every new Level 51 identity activation.
          </p>
        </div>
        <DonLienPortrait
          src={pageImages.home}
          role="LIEN Intake Guide"
          outfit="Blue presidential suit with red glowing DONLIEN tie"
          objectPosition="48% 40%"
        />
      </section>
      <BecomeLienWizard />
    </PageFrame>
  );
}
