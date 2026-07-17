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
  slides,
  accent = "#39FF14",
}: DonLienStoryDeckProps) {
  return (
    <section className="mx-auto max-w-[1120px] px-4 pb-10 md:px-8">
      <HudPanel title={eyebrow} accent={accent}>
        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="font-display max-w-4xl text-4xl font-black uppercase leading-none md:text-6xl">{title}</h2>
          <div className="flex shrink-0 items-center gap-2 text-sm uppercase text-zinc-300">
            <ChevronLeft size={18} />
            Swipe
            <ChevronRight size={18} />
          </div>
        </div>
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${title} swipe panels`}
        >
          {slides.map((slide, index) => (
            <article
              className="grid min-h-[260px] min-w-full snap-center content-center border border-white/15 bg-black/34 p-6 sm:p-8"
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
