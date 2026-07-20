"use client";

import { useRef, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollerRef = useRef<HTMLDivElement>(null);

  function handleDeckKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      scroller.scrollBy({
        left: event.key === "ArrowLeft" ? -scroller.clientWidth : scroller.clientWidth,
        behavior: "smooth",
      });
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      scroller.scrollTo({
        left: event.key === "Home" ? 0 : scroller.scrollWidth,
        behavior: "smooth",
      });
    }
  }

  return (
    <section className="mx-auto max-w-[1120px] overflow-hidden px-4 pb-10 md:px-8">
      <HudPanel title={eyebrow} accent={accent}>
        <div className="mb-5 grid min-w-0 gap-3 overflow-hidden">
          <p className="font-display text-sm font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
            Slide Panels
          </p>
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="font-display max-w-full break-words text-3xl font-black uppercase leading-none sm:text-4xl md:text-5xl">
              {title}
            </h2>
            <div className="flex shrink-0 items-center gap-2 text-sm uppercase text-zinc-300">
              <ChevronLeft size={18} />
              Swipe
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
        <div
          className="grid w-full max-w-full auto-cols-[100%] grid-flow-col snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${title} swipe panels`}
          onKeyDown={handleDeckKeyDown}
          ref={scrollerRef}
          tabIndex={0}
        >
          {slides.map((slide, index) => (
            <article
              className="grid min-h-[260px] min-w-0 max-w-full snap-center content-center overflow-hidden border border-white/15 bg-black/34 p-6 sm:p-8"
              key={slide.title}
            >
              <p className="font-display text-sm font-bold uppercase" style={{ color: accent }}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display mt-3 break-words text-2xl font-black uppercase text-white">{slide.title}</h3>
              <p className="mt-4 break-words text-base leading-7 text-zinc-200">{slide.copy}</p>
            </article>
          ))}
        </div>
      </HudPanel>
    </section>
  );
}
