export function HologramGlobe({ accent = "#35ECFF" }: { accent?: string }) {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[420px] place-items-center overflow-hidden rounded-full border" style={{ borderColor: accent }}>
      <div className="absolute inset-[8%] rounded-full border border-current opacity-50" style={{ color: accent }} />
      <div className="absolute inset-[20%] rounded-full border border-current opacity-35" style={{ color: accent }} />
      <div className="absolute h-[120%] w-px bg-current opacity-50" style={{ color: accent }} />
      <div className="absolute h-px w-[120%] bg-current opacity-50" style={{ color: accent }} />
      <div className="absolute inset-8 rounded-full border border-dashed opacity-70" style={{ borderColor: accent }} />
      <svg className="relative z-10 h-[82%] w-[82%]" viewBox="0 0 400 400" aria-hidden="true">
        <path d="M71 193c31-66 76-102 143-107 66-5 112 18 139 70-40-22-80-26-120-12-41 14-77 12-108-5-19 13-37 31-54 54Z" fill="none" stroke={accent} strokeWidth="3" />
        <path d="M108 259c52-25 94-27 126-6 35 23 70 25 105 6-30 46-72 70-126 72-55 2-90-22-105-72Z" fill="none" stroke={accent} strokeWidth="3" />
        {Array.from({ length: 18 }).map((_, index) => (
          <circle key={index} cx={60 + ((index * 47) % 280)} cy={76 + ((index * 71) % 240)} r="4" fill={accent} opacity="0.9" />
        ))}
        <path d="M62 238c88-52 183-62 280-30" fill="none" stroke={accent} strokeWidth="2" opacity="0.55" />
        <path d="M86 142c75 51 154 68 238 52" fill="none" stroke={accent} strokeWidth="2" opacity="0.55" />
      </svg>
      <div className="absolute inset-0 animate-pulse bg-current opacity-[0.05]" style={{ color: accent }} />
    </div>
  );
}
