import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HudPanel } from "./HudPanel";

type Slide = {
  title: string;
  copy: string;
};

type DonLienStoryDeckProps = {
  eyebrow: string;
  title: string;
  image: string;
  slides: Slide[];
  accent?: string;
};

export function DonLienStoryDeck({
  eyebrow,
  title,
  image,
  slides,
  accent = "#39FF14",
}: DonLienStoryDeckProps) {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-4 pb-10 md:px-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)]">
      <div className="hud-panel clip-hud relative min-h-[360px] overflow-hidden bg-black/20 lg:min-h-[520px]">
        <Image
          src={image}
          alt="DonLien visual"
          fill
          sizes="(max-width: 1024px) 92vw, 620px"
          className="object-contain p-3"
        />
      </div>
      <HudPanel title={eyebrow} accent={accent}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-black uppercase md:text-6xl">{title}</h2>
          <div className="hidden shrink-0 items-center gap-2 text-sm uppercase text-zinc-300 sm:flex">
            <ChevronLeft size={18} />
            Swipe
            <ChevronRight size={18} />
          </div>
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((slide, index) => (
            <article
              className="min-h-[230px] min-w-[82%] snap-start border border-white/15 bg-black/26 p-5 sm:min-w-[58%] lg:min-w-[48%]"
              key={slide.title}
            >
              <p className="font-display text-sm font-bold uppercase" style={{ color: accent }}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display mt-3 text-2xl font-black uppercase text-white">{slide.title}</h3>
              <p className="mt-4 text-base leading-7 text-zinc-200">{slide.copy}</p>
            </article>
          ))}
        </div>
      </HudPanel>
    </section>
  );
}
