import type { CSSProperties } from "react";
import { HudPanel } from "./HudPanel";

type Slide = {
  title: string;
  copy: string;
};

type DonLienStoryDeckProps = {
  eyebrow: string;
  title: string;
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
    <section className="mx-auto w-full max-w-[1320px] px-4 pb-12 md:px-8">
      <HudPanel title={eyebrow} accent={accent}>
        <div className="mb-7 max-w-4xl">
          <p className="font-display text-sm font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
            Field Briefing
          </p>
          <h2 className="font-display mt-3 break-words text-3xl font-black uppercase leading-none sm:text-4xl md:text-5xl">
            {title}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2" aria-label={`${title} briefing sections`}>
          {slides.map((slide) => (
            <article
              className="border border-white/15 bg-black/55 p-6 shadow-[inset_3px_0_0_var(--briefing-accent)] sm:p-8"
              style={{ "--briefing-accent": accent } as CSSProperties}
              key={slide.title}
            >
              <h3 className="font-display break-words text-2xl font-black uppercase text-white">{slide.title}</h3>
              <p className="mt-4 break-words text-base leading-7 text-zinc-200">{slide.copy}</p>
            </article>
          ))}
        </div>
      </HudPanel>
    </section>
  );
}
