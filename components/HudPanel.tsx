import type { CSSProperties, ReactNode } from "react";

type HudPanelProps = {
  title?: string;
  children: ReactNode;
  accent?: string;
  className?: string;
};

export function HudPanel({ title, children, accent, className = "" }: HudPanelProps) {
  return (
    <section className={`hud-panel clip-hud p-5 ${className}`} style={{ "--accent": accent } as CSSProperties}>
      {title ? (
        <h2 className="font-display mb-3 text-lg font-bold uppercase tracking-[0.08em]" style={{ color: accent }}>
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
